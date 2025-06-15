import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
import joblib

# Load dataset
df = pd.read_csv('AQI_Dataset23_24.csv')

# Drop the non-numeric 'Timestamp' column
df = df.drop(columns=['Timestamp'])

# Interpolate all numeric columns linearly
df_interpolated = df.interpolate(method='linear', limit_direction='both')

# Handle remaining NaNs at edges (start or end)
df_filled = df_interpolated.ffill().bfill()

# Create AQI of next day column
df_filled['AQI_Day2'] = df_filled['AQI'].shift(-1).fillna(30.0)

# Drop the last row if it has any remaining NaN
df_filled = df_filled.dropna()

# Feature and target separation
X = df_filled.drop(['AQI', 'AQI_Day2'], axis=1)

# Target 1: Current Day AQI
y_today = df_filled['AQI']

# Target 2: Next Day AQI
y_day2 = df_filled['AQI_Day2']

# Scale the data (standardization)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save the scaler for later use in the backend server
joblib.dump(scaler, 'scaler.pkl')
print("✅ Scaler saved as 'scaler.pkl'.")

# Train-test split
X_train, X_test, y1_train, y1_test = train_test_split(X_scaled, y_today, test_size=0.22, random_state=0)
Xt1, Xt2, y2_train, y2_test = train_test_split(X_scaled, y_day2, test_size=0.29, random_state=42)

# (1) Linear Regression
lr1 = LinearRegression()   # first object for same day AQI
lr1.fit(X_train, y1_train)

lr2 = LinearRegression()    # second object for next day AQI
lr2.fit(Xt1, y2_train)

# (2) Decision Tree
dtr_1 = DecisionTreeRegressor(   # first object for same day AQI
    max_depth=100,
    min_samples_split=100,
    min_samples_leaf=5,
    random_state=42
)
dtr_1.fit(X_train, y1_train)

dtr_2 = DecisionTreeRegressor(    # second object for next day AQI
    max_depth=100,
    min_samples_split=100,
    min_samples_leaf=5,
    random_state=42
)
dtr_2.fit(Xt1, y2_train)

# (3) SVR (Support Vector Regressor)
param_grid_svr = {
    'C': [0.1, 1, 5, 10],
    'kernel': ['linear', 'rbf', 'poly'],
    'gamma': ['scale', 'auto'],
    'epsilon': [0.01, 0.1, 0.2]
}

svr_1 = SVR()      # first object for same day AQI
search3 = RandomizedSearchCV(
    estimator=svr_1,
    param_distributions=param_grid_svr,
    n_iter=50,
    cv=5,
    random_state=42,
    n_jobs=-1,
    scoring='r2',
    verbose=1
)
search3.fit(X_train, y1_train)

svr_2 = SVR()     # second object for next day AQI
search4 = RandomizedSearchCV(
    estimator=svr_2,
    param_distributions=param_grid_svr,
    n_iter=50,
    cv=5,
    random_state=42,
    n_jobs=-1,
    scoring='r2',
    verbose=1
)
search4.fit(Xt1, y2_train)

# (4) Random Forest
param_grid_rf = {
    'n_estimators': [100, 200, 300, 500, 700, 1000],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2', None]
}

rf_1 = RandomForestRegressor(random_state=42)    # first object for same day AQI
search1 = RandomizedSearchCV(
    estimator=rf_1,
    param_distributions=param_grid_rf,
    n_iter=20,
    cv=5,
    scoring='r2',
    random_state=42,
    n_jobs=-1,
    verbose=1
)
search1.fit(X_train, y1_train)

rf_2 = RandomForestRegressor(random_state=42)   # second object for next day AQI
search2 = RandomizedSearchCV(
    estimator=rf_2,
    param_distributions=param_grid_rf,
    n_iter=10,
    cv=5,
    scoring='r2',
    random_state=42,
    n_jobs=-1,
    verbose=1
)
search2.fit(Xt1, y2_train)

# Save the best models
best_model1 = search1.best_estimator_
joblib.dump(best_model1, 'aqi_predictor_day1.pkl')
print("✅ Tuned model for same day AQI saved as 'aqi_predictor_day1.pkl'.")

best_model2 = search2.best_estimator_
joblib.dump(best_model2, 'aqi_predictor_day2.pkl')
print("✅ Tuned model for next day AQI saved as 'aqi_predictor_day2.pkl'.")

# Evaluate models on test data
y1_pred = search1.predict(X_test)
y2_pred = search2.predict(Xt2)  

print("\n📊 Accuracy for aqi_predictor_day1 (same day AQI):")
print(f"R² Score: {r2_score(y1_test, y1_pred):.4f}")
print(f"MAE: {mean_absolute_error(y1_test, y1_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y1_test, y1_pred)):.4f}")

print("\n📊 Accuracy for aqi_predictor_day2 (next day AQI):")
print(f"R² Score: {r2_score(y2_test, y2_pred):.4f}")
print(f"MAE: {mean_absolute_error(y2_test, y2_pred):.4f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y2_test, y2_pred)):.4f}")

from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import pandas as pd
import joblib
import traceback
app = FastAPI()
model = joblib.load("models/traffic_density_voting_model-Copy1.joblib")
class TrafficInput(BaseModel):
    start_area: str
    end_area: str
    distance_km: float
    time_of_day: str
    day_of_week: str
    weather_condition: str
    road_type: str
    average_speed_kmph: float
    travel_time_minutes: float
@app.post("/predict")
def predict_density(data: TrafficInput = Body(...)):
    try:
        input_df = pd.DataFrame([{
            "start_area": data.start_area,
            "end_area": data.end_area,
            "distance_km": data.distance_km,
            "time_of_day": data.time_of_day,
            "day_of_week": data.day_of_week,
            "weather_condition": data.weather_condition,
            "road_type": data.road_type,
            "average_speed_kmph": data.average_speed_kmph,
            "travel_time_minutes": data.travel_time_minutes
        }])

        prediction = model.predict(input_df)
        print(data)

        return {"predicted_density": prediction[0]}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
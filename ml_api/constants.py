# Global feature averages from pulse_dataset.csv for filling missing inputs
FEATURE_AVERAGES = {
    "sleep_hours": 5.944135,
    "study_hours": 6.214414,
    "screen_time_hours": 5.289651,
    "exercise_mins": 27.55959,
    "mood_score": 3.295959,
    "stress_level": 2.964698,
    "caffeine_intake": 2.75049,
    "water_litres": 2.307828,
    "deep_focus_blocks": 3.4507,
    "social_media_mins": 110.88499,
    "focus_duration_mins": 227,
    "focus_quality_score": 3.67,
    "distraction_level_encoded": 1,
    "day_of_week": "Monday",
    "is_weekend": 0
}

# Feature columns required by models
CORE_FEATURES = [
    'sleep_hours', 'study_hours', 'screen_time_hours',
    'exercise_mins', 'mood_score', 'stress_level',
    'caffeine_intake', 'water_litres', 'deep_focus_blocks',
    'social_media_mins', 'focus_duration_mins',
    'focus_quality_score', 'distraction_level_encoded'
]

CLASSIFIER_FEATURES = CORE_FEATURES + ['day_of_week', 'is_weekend']

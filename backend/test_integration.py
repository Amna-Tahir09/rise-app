from database_service import create_user, save_onboarding_answer, save_habit_log, get_user_logs

user = create_user(email="demo@example.com", password="testpass123", mode="habit_tracker")
print("Created user:", user.id)

save_onboarding_answer(user.id, "What's your main goal?", "Build a consistent gym habit")

save_habit_log(user.id, "Gym", done=False, note="Too tired after work, skipped again")

logs = get_user_logs(user.id)
for log in logs:
    print(log.habit_name, log.done, log.note)

    
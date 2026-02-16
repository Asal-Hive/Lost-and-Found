from __future__ import annotations
from typing import Optional

def _is_persian(text: str) -> bool:
    return any("\u0600" <= ch <= "\u06FF" for ch in (text or ""))

def _fallback_message(q: str, n: int) -> str:
    fa = _is_persian(q)
    if fa:
        if n == 0:
            return "متوجه شدم. فعلاً مورد خیلی مرتبطی پیدا نکردم. اگر رنگ/مکان/زمان دقیق‌تر رو بگی بهتر می‌تونم پیدا کنم."
        return f"متوجه شدم. {n} مورد مرتبط پیدا کردم. لینک‌ها رو پایین گذاشتم."
    else:
        if n == 0:
            return "Got it. I didn’t find a strong match yet — add color/location/time for better matching."
        return f"Got it — I found {n} relevant item(s). Links are below."

def generate_chatty_message_openai(
    api_key: str,
    user_query: str,
    n_results: int,
    model: str = "gpt-4.1-mini",
) -> str:

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        fa = _is_persian(user_query)
        instructions = (
            "تو یک دستیار خیلی کوتاه‌گو برای سامانه گمشده‌ها/پیداشده‌ها هستی. "
            "در ۱ تا ۲ جمله دوستانه فارسی جواب بده. "
            "اگر نتیجه کم بود فقط یک سوال کوتاه بپرس. "
            "بدون لیست و بدون مارک‌داون."
        ) if fa else (
            "You are a very concise assistant for a campus lost-and-found app. "
            "Reply in 1–2 friendly sentences. "
            "If results are weak, ask ONE short clarifying question. "
            "No markdown, no lists."
        )

        input_text = (
            f"User message: {user_query}\n"
            f"Retrieved results count: {n_results}\n"
            "Write the short assistant reply now."
        )

        resp = client.responses.create(
            model=model,
            instructions=instructions,
            input=input_text,
        )

        text = (resp.output_text or "").strip()
        
        return text if text else _fallback_message(user_query, n_results)
    except Exception as e:
        return _fallback_message(user_query, n_results)


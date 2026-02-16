
from __future__ import annotations
from typing import Optional, List, Dict, Any

def _is_persian(text: str) -> bool:
    return any("\u0600" <= ch <= "\u06FF" for ch in (text or ""))

def _fallback_message(q: str, top_results: List[Dict[str, Any]]) -> str:
    fa = _is_persian(q)
    n = len(top_results)

    if fa:
        if n == 0:
            return "متوجه شدم. فعلاً موردی با ارتباط کافی پیدا نکردم."
        # mention up to 3 titles
        titles = "، ".join([f"«{r.get('title','')}»" for r in top_results[:3] if r.get("title")])
        return f"{n} نتیجهٔ نزدیک پیدا کردم. نزدیک‌ترین‌ها: {titles}."
    else:
        if n == 0:
            return "Got it. I couldn’t find a strong enough match."
        titles = ", ".join([f"“{r.get('title','')}”" for r in top_results[:3] if r.get("title")])
        return f"I found {n} close match(es). Top results: {titles}."

def generate_chatty_message_openai(
    api_key: str,
    user_query: str,
    top_results: List[Dict[str, Any]],
    model: str = "gpt-4.1-mini",
) -> str:
    """
    Requirements:
    - No questions
    - Only explain the results
    - Model sees only top_results (top 3 from the view)
    """
    # If no key, never call OpenAI
    if not api_key or not api_key.strip():
        return _fallback_message(user_query, top_results)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key.strip())

        fa = _is_persian(user_query)

        if fa:
            instructions = (
                "تو دستیار سامانه گمشده‌ها/پیداشده‌ها هستی. "
                "فقط نتایج داده‌شده را توضیح بده و خلاصه کن. "
                "هیچ سوالی نپرس. هیچ درخواست اطلاعات بیشتر نده. "
                "در ۱ تا ۲ جمله فارسی طبیعی جواب بده. "
                "بدون لیست و بدون مارک‌داون."
            )
        else:
            instructions = (
                "You are an assistant for a campus lost-and-found app. "
                "Only explain/summarize the provided results. "
                "Do NOT ask any questions. Do NOT request more details. "
                "Reply in 1–2 natural sentences. "
                "No markdown, no lists."
            )

        # Build compact view of the top 3 for the model
        lines = []
        for i, r in enumerate(top_results[:3], start=1):
            lines.append(
                f"{i}) title={r.get('title')} | status={r.get('status')} | location={r.get('location_name')} | score={r.get('score')}"
            )
        top_text = "\n".join(lines) if lines else "(no results)"

        input_text = (
            f"User message: {user_query}\n"
            f"Top results (max 3):\n{top_text}\n"
            "Explain the results briefly now."
        )

        resp = client.responses.create(
            model=model,
            instructions=instructions,
            input=input_text,
        )

        text = (resp.output_text or "").strip()
        return text if text else _fallback_message(user_query, top_results)

    except Exception:
        return _fallback_message(user_query, top_results)

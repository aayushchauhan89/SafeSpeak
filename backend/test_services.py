import json
from services import get_lime_explanation, rewrite_toxic_comment

def run_tests():
    test_comment = "You are a terrible person and completely stupid."
    
    print("=== Testing LIME Explainability ===")
    lime_result = get_lime_explanation(test_comment)
    print(json.dumps(lime_result, indent=2))
    
    print("\n=== Testing Gemini API Rewrite ===")
    gemini_result = rewrite_toxic_comment(test_comment)
    print(json.dumps(gemini_result, indent=2))

if __name__ == "__main__":
    run_tests()
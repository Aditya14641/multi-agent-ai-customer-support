import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datasets import load_dataset
from agents.intent_detector import detect_intent
import pandas as pd
import json
from datetime import datetime
import time

BANKING77_TO_TECHMART = {
    "card_payment_fee_charged": "billing",
    "card_payment_wrong_exchange_rate": "billing",
    "extra_charge_on_statement": "billing",
    "pending_charge_disappear": "billing",
    "pending_top_up": "billing",
    "top_up_failed": "billing",
    "top_up_limits": "billing",
    "top_up_reverted": "billing",
    "transaction_charged_twice": "billing",
    "wrong_amount_of_cash_received": "billing",
    "cash_withdrawal_charge": "billing",
    "card_not_working": "billing",
    "declined_card_payment": "billing",
    "declined_cash_withdrawal": "billing",
    "declined_transfer": "billing",
    "transfer_fee_charged": "billing",
    "transfer_into_account": "billing",
    "transfer_not_received_by_recipient": "billing",
    "transfer_timing": "billing",
    "receiving_money": "billing",
    "request_refund": "refund",
    "refund_not_showing_up": "refund",
    "activate_my_card": "technical",
    "apple_pay_or_google_pay": "technical",
    "automatic_top_up": "technical",
    "balance_not_updated_after_bank_transfer": "technical",
    "card_arrival": "technical",
    "card_linking": "technical",
    "card_swallowed": "technical",
    "change_pin": "technical",
    "compromised_card": "technical",
    "contactless_not_working": "technical",
    "edit_personal_details": "technical",
    "failed_transfer": "technical",
    "get_physical_card": "technical",
    "lost_or_stolen_card": "technical",
    "lost_or_stolen_phone": "technical",
    "order_physical_card": "technical",
    "passcode_forgotten": "technical",
    "pending_card_payment": "technical",
    "pending_cash_withdrawal": "technical",
    "pending_transfer": "technical",
    "pin_blocked": "technical",
    "reverted_card_payment": "technical",
    "terminate_account": "technical",
    "topping_up_by_card": "technical",
    "transaction_not_recognised": "technical",
    "virtual_card_not_working": "technical",
    "best_available_transfers_option": "product",
    "card_acceptance": "product",
    "card_delivery_estimate": "product",
    "country_support": "product",
    "disposable_card_limits": "product",
    "exchange_charge": "product",
    "exchange_rate": "product",
    "exchange_via_app": "product",
    "get_disposable_virtual_card": "product",
    "card_about_to_expire": "faq",
    "fiat_currency_support": "faq",
    "getting_spare_card": "faq",
    "identity_document_verification": "faq",
    "getting_virtual_card": "faq",
    "top_up_by_bank_transfer_charge": "faq",
    "top_up_by_card_charge": "faq",
    "top_up_by_cash_or_cheque": "faq",
    "unable_to_verify_identity": "faq",
    "verify_my_identity": "faq",
    "verify_source_of_funds": "faq",
    "verify_top_up": "faq",
    "visa_or_mastercard": "faq",
    "why_verify_identity": "faq",
    "supported_cards_and_currencies": "faq",
    "beneficiary_not_allowed": "faq",
    "age_limit": "faq",
    "atm_support": "faq",
    "cash_withdrawal_not_recognised": "billing",
    "wrong_exchange_rate_for_cash_withdrawal": "billing",
}

def load_banking77_sample(n_samples: int = 100):
    print("Downloading Banking77 dataset from HuggingFace...")
    dataset = load_dataset("PolyAI/banking77", split="test")
    label_names = dataset.features["label"].names
    samples = []
    seen_labels = set()
    for item in dataset:
        label_name = label_names[item["label"]]
        if label_name in BANKING77_TO_TECHMART:
            if label_name not in seen_labels or len(samples) < n_samples // 2:
                samples.append({
                    "text": item["text"],
                    "banking77_label": label_name,
                    "expected_techmart_intent": BANKING77_TO_TECHMART[label_name]
                })
                seen_labels.add(label_name)
        if len(samples) >= n_samples:
            break
    print(f"Loaded {len(samples)} samples covering {len(seen_labels)} unique intents")
    return samples

def run_evaluation(samples: list, delay: float = 0.5):
    results = []
    correct = 0
    total = len(samples)
    print(f"\nRunning intent detection on {total} samples...")
    print("-" * 60)
    for i, sample in enumerate(samples):
        prediction = detect_intent(sample["text"])
        predicted_intents = prediction.get("intents", ["faq"])
        confidence = prediction.get("confidence", 0.0)
        expected = sample["expected_techmart_intent"]
        is_correct = expected in predicted_intents
        if is_correct:
            correct += 1
        results.append({
            "text": sample["text"],
            "banking77_label": sample["banking77_label"],
            "expected": expected,
            "predicted": predicted_intents,
            "confidence": confidence,
            "correct": is_correct
        })
        if (i + 1) % 10 == 0:
            running_acc = correct / (i + 1) * 100
            print(f"  Progress: {i+1}/{total} | Running Accuracy: {running_acc:.1f}%")
        time.sleep(delay)
    return results, correct, total

def generate_report(results: list, correct: int, total: int):
    accuracy = correct / total * 100
    intent_stats = {}
    for r in results:
        exp = r["expected"]
        if exp not in intent_stats:
            intent_stats[exp] = {"correct": 0, "total": 0}
        intent_stats[exp]["total"] += 1
        if r["correct"]:
            intent_stats[exp]["correct"] += 1
    intent_accuracy = {
        k: round(v["correct"] / v["total"] * 100, 1)
        for k, v in intent_stats.items()
    }
    failures = [r for r in results if not r["correct"]]
    report = {
        "evaluation_date": datetime.now().isoformat(),
        "dataset": "Banking77 (PolyAI/banking77)",
        "model_used": "TechMart Intent Detection Agent (LLM-based)",
        "total_samples": total,
        "correct_predictions": correct,
        "overall_accuracy": round(accuracy, 2),
        "per_intent_accuracy": intent_accuracy,
        "failure_count": len(failures),
        "sample_failures": failures[:5]
    }
    os.makedirs("evaluation/results", exist_ok=True)
    report_path = "evaluation/results/banking77_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    df = pd.DataFrame(results)
    csv_path = "evaluation/results/banking77_results.csv"
    df.to_csv(csv_path, index=False)
    print("\n" + "=" * 60)
    print("BANKING77 EVALUATION REPORT")
    print("=" * 60)
    print(f"  Dataset         : Banking77 (PolyAI)")
    print(f"  Total Samples   : {total}")
    print(f"  Correct         : {correct}")
    print(f"  Overall Accuracy: {accuracy:.2f}%")
    print("\n  Per-Intent Accuracy:")
    for intent, acc in sorted(intent_accuracy.items(), key=lambda x: -x[1]):
        bar = "=" * int(acc / 5)
        print(f"    {intent:<12} {bar:<20} {acc}%")
    print(f"\n  Report saved: {report_path}")
    print(f"  CSV saved   : {csv_path}")
    print("=" * 60)
    return report

def main():
    print("=" * 60)
    print("  Banking77 Intent Detection Evaluation")
    print("  TechMart Multi-Agent AI Project")
    print("=" * 60)
    samples = load_banking77_sample(n_samples=100)
    results, correct, total = run_evaluation(samples, delay=0.3)
    generate_report(results, correct, total)
    print("\nEvaluation complete!")

if __name__ == "__main__":
    main()

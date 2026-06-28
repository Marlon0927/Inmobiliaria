from fastapi import FastAPI
from app.schemas.evaluation_request import EvaluationRequest
from app.rules.rule_engine import RuleEngine

app = FastAPI()

@app.post("/evaluate")
def evaluate(
        request: EvaluationRequest
):

    return RuleEngine.evaluate(
        request
    )
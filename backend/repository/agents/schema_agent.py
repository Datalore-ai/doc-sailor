from dotenv import load_dotenv
import json

from repository.schemas import DatasetSchema
from repository.system_prompts import schema_generate_prompt
from repository.client_initialization import openai_client

load_dotenv()

def generate_dataset_schema(
    user_concept: str, model_name: str = "gpt-4.1-mini"
) -> DatasetSchema:
    response = openai_client.responses.parse(
        model=model_name,
        input=[
            {"role": "system", "content": schema_generate_prompt},
            {"role": "user", "content": user_concept},
        ],
        text_format=DatasetSchema,
    )

    result = response.output_parsed

    return result

if __name__ == "__main__":
    task_description = "I want to generate a dataset for fine-tuning an LLM in a particular SQL task where there will be a natural language question asked by the user, a database schema will be provided as context and the corresponding SQL query will be the expected output."

    dataset_schema = generate_dataset_schema(task_description)
    print(dataset_schema)

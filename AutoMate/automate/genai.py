import json
# from langchain import OpenAI
# from langchain.llms import Groq
from automate.utils import tools
from langchain_groq import ChatGroq
from langchain_ollama import OllamaLLM
llm = ChatGroq(model_name="llama-3.1-70b-versatile", temperature=0,api_key="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")
# llm = OllamaLLM(model="llama3.2:latest")
app = tools(llm)

def load_mappings(file_path):
    with open(file_path, 'r') as json_file:
        return json.load(json_file)

def create_prompt(user_input, template_mappings,function_mappings):
    prompt = f"You are an assistant that helps users automate tasks using templates.\n"
    prompt += f"User Input: {user_input}\n\n"
    prompt += "Template Mappings:\n"
    
    for mapping in template_mappings['templateMappings']:
        prompt += f"- {mapping['description']} (Path: {mapping['path']})\n"

    prompt += "\nFunction Mappings:\n"
    
    for mapping in function_mappings['functionMappings']:
            prompt += (
                f"- Function: {mapping['functionName']}\n"
                f"  Description: {mapping['description']}\n"
                f"  Parameters:\n"
            )
            for param, details in mapping['parameters'].items():
                prompt += f"    - {param} ({details['type']}): {details['description']}\n"
            prompt += f"  Example: {mapping['example']}\n\n"
    
    prompt += "\nBased on the user input, template mappings, and function mappings, generate the appropriate function sequence:\n"
    prompt += "\nReturn the function calls syntax without any additional explanation or context no description no textual info .\n"
    
    return prompt


def query_llm(prompt):    
    # os.environ['GROQ_API_KEY'] = 'groq_api_key'  
    response = llm.invoke(prompt)
    return response


def main():
    template_mappings = load_mappings('/home/ayush/Code/AutoMate/automate/template_mapping.json')
    function_mapping = load_mappings('/home/ayush/Code/AutoMate/automate/function_mapping.json')
    
    user_input = input("Please enter your command (e.g., 'open YouTube'): ")
    
    prompt = create_prompt(user_input, template_mappings , function_mapping)
    
    response = query_llm(prompt)
    # print(prompt)
    print("Generated function sequence:")
    # print(response)
    function_calls = response.content.strip().splitlines()
    # print("Generated function sequence:")
    for call in function_calls:
        print(call)
        exec(f"app.{call}")
        

if __name__ == "__main__":
    main()

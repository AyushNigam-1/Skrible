from langchain_groq import ChatGroq
from automate.Browser import tools
from dotenv import load_dotenv
import os
import time
load_dotenv()

llm = ChatGroq(model_name="llama-3.1-70b-versatile", temperature=0, groq_api_key=os.getenv('groq_api_key'))

app = tools(llm)

app_path = app.open("microsoft edge")
app.detect_and_write("hey love u",'/automate/templates/image.png')
time.sleep(10)
# app.search_in_application("youtube videos")



print(f"Generated path: {app_path}")

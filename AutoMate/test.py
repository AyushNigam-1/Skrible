from langchain_groq import ChatGroq
from automate.browser import tools
from dotenv import load_dotenv
import os
import time
load_dotenv()
llm = ChatGroq(model_name="llama-3.1-70b-versatile", temperature=0, groq_api_key=os.getenv('groq_api_key'))
app = tools(llm)
app.open("microsoft edge")
app.detect_and_write("/home/ayush/Code/AutoMate/templates/image.png","linkedin",press_enter=True)
app.detect_and_click("/home/ayush/Code/AutoMate/templates/image2.png",True)
app.detect_and_click("/home/ayush/Code/AutoMate/templates/image5.png",True)
app.detect_and_scroll("/home/ayush/Code/AutoMate/templates/image6.png",scroll_until="/home/ayush/Code/AutoMate/templates/image7.png",click_on_detect=True)
app.detect_and_write("/home/ayush/Code/AutoMate/templates/image8.png","Hey I am ayush")
app.close()

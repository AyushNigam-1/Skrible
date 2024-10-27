from langchain_groq import ChatGroq
from automate.utils import tools
from dotenv import load_dotenv
import os
load_dotenv()
llm = ChatGroq(model_name="llama-3.1-70b-versatile", temperature=0, groq_api_key=os.getenv('groq_api_key'))
app = tools(llm)
app.open("microsoft edge")
app.detect_and_click("/home/ayush/Code/AutoMate/templates/youtube_icon.png")
app.detect_and_write("/home/ayush/Code/AutoMate/templates/youtube_search.png","mitraz",press_enter=True)
app.detect_and_scroll("/home/ayush/Code/AutoMate/templates/youtube_search_home.png",text="Tera Naam",click_on_detect=True)
# app.detect_and_write("/home/ayush/Code/AutoMate/templates/image.png","linkedin",press_enter=True,mask_text=False)
# app.detect_and_click("/home/ayush/Code/AutoMate/templates/image2.png",True,mask_text=False)
# app.detect_and_click("/home/ayush/Code/AutoMate/templates/image5.png",True,mask_text=False)
# app.detect_and_scroll("/home/ayush/Code/AutoMate/templates/image6.png",scroll_until="/home/ayush/Code/AutoMate/templates/image7.png",click_on_detect=True , threshold=0.6)
# app.detect_and_write("/home/ayush/Code/AutoMate/templates/image8.png","Hey I am ayush")
# app.close()

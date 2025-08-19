import asyncio
import time
from aiosmtpd.controller import Controller
from aiosmtpd.handlers import AsyncMessage
import internal
from database import init_database, save_ticket_response

class ITBotHandler(AsyncMessage):
    
    def __init__(self):
        super().__init__()
        self.processed_count = 0
    
    async def handle_message(self, message):
        try:
            self.processed_count += 1

            from_header = message.get('From', 'Unknown')
            subject = message.get('Subject', 'No Subject')
            body = str(message.get_payload())
            ticket_id = message.get('X-Ticket-ID', f'{int(time.time())}_{self.processed_count}')
            
            if internal.leadership_email in from_header.lower():
                response = "C-Suite ticket received! Will escalate immediately!" + f"\n{internal.flag}"
            elif internal.support_email in from_header.lower():
                response = "Request for support received! Will resolve after lunch break."
            else:
                response = "Please use our support portal to submit a ticket."
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, 
                save_ticket_response, 
                ticket_id, 
                from_header, 
                subject, 
                body, 
                response, 
                'it_bot'
            )
            
            return "250 Message accepted for delivery"
            
        except Exception as e:
            print(f"Error in handle_message: {e}")
            import traceback
            traceback.print_exc()
            return "450 Temporary failure"

async def start_server():
    init_database()
    
    it_handler = ITBotHandler()
    controller = Controller(it_handler, hostname='localhost', port=1025)
    
    controller.start()
    
    return controller

async def main():
    controller = await start_server()
    
    try:
        while True:
            await asyncio.sleep(5)
    except KeyboardInterrupt:
        controller.stop()

if __name__ == "__main__":
    asyncio.run(main())
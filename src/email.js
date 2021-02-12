import axios from 'axios'

export const send = async (text) => {
  var data = {
    service_id: process.env.SERVICE_ID,
    template_id: process.env.TEMPLATE_ID,
    user_id: process.env.USER_ID,
    template_params: {
      event: text,
    }
  };
  try{
    axios.post('https://api.emailjs.com/api/v1.0/email/send',data)
  } catch(e) {
    console.log(JSON.stringify(e,null,2))
  }
}

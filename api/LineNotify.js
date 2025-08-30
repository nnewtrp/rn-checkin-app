import { line_notify_token } from "@env";

export default function(type, user, time, latlng) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + line_notify_token);

  var formdata = new FormData();
  formdata.append("message", user + 
                    " " + type + "งานแล้วเมื่อเวลา " + time +
                    " น.\nhttps://maps.google.com/?q=" + latlng.latitude
                    + "," + latlng.longitude
                  );

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };

  fetch("https://notify-api.line.me/api/notify", requestOptions)
    .then(response => response.json())
    .then(result => console.log(result, line_notify_token * 0))
    .catch(error => console.log('error', error));
}
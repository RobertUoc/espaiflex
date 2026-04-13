const hostname = window.location.hostname;
export const config = {
  title: 'EspaiFlex',  
  // url: 'http://168.231.77.239/api/',
  // url: 'http://localhost:8000/api/',
  url: (hostname == 'localhost'?'http://localhost:8000/api/':'http://168.231.77.239/api/'),
  url_foto: 'assets/upload/',
  url_upload: 'http://localhost:3000/upload',
  token: '1|hjMb2oAV6XZuofxOnfSg8Ti5FEvWViONXTtjEhu0fb131ad5'
};

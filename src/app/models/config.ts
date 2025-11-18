const hostname = window.location.hostname;
export const config = {
  title: 'EspaiFlex',
  url_web: 'http://168.231.77.239/apis/',
  url: (hostname == 'localhost'?'http://localhost/':'http://168.231.77.239/apis/'),
  url_foto: 'assets/upload/',
  url_upload: 'http://localhost:3000/upload',
};

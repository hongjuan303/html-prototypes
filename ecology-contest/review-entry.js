const query=new URLSearchParams(location.search);
if(window===window.parent&&!query.has('standalone')){
  location.replace('./review.html'+location.search+(location.hash||'#/events'));
}else{
  await import('./app.js?v=20261103-v6');
  if(query.has('embedded'))await import('./review-bridge.js?v=20261103-v6');
}

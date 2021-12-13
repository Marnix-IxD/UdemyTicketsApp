import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined'){
    //Window only exists in the browser, therefor if this is true we're in our client kubernetes container.
    //kubectl get namespaces -> kubectl get services -n namespace 
    //http://SERVICE-NAME.NAMESPACE.svc.clust.local/ 
    //Pass along ALL headers on the initial request as it contains the Host header which points to the ingress.srv.yaml host
    return axios.create({
      baseURL: process.env.NGINX_URL,
      headers: req.headers
    });
  } else {
    //We're in the browser
    //Base url of "" will suffice as browsers will automatically append the rest of the url to the end.
    //Destructuring the property data from response.data 
    return axios.create({
      baseURL: ''
    });
  }
}

export default buildClient;
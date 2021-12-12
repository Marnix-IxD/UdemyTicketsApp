//Using global css in Next.js is weird, watch class 201 if you wish to know why.
import 'bootstrap/dist/css/bootstrap.css';

import buildClient from '../api/build-client';
import HeaderComponent from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <HeaderComponent currentUser={currentUser}/>
      <main className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </main>
    </div>
  );
};

//App in next.js has a different context structure from pages.
//Props on app context: AppTree || Component || router || ctx 
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  
  //We've got to manually trigger getInitialProps for pages because otherwise it won't work.
  let pageProps = {};
  if(appContext.Component.getInitialProps){
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const signUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { performRequest, errors } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: {
      email, 
      password
    },
    onSuccess: () => Router.push('/')
  });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    performRequest();
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label htmlFor="email">E-mail address</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          name="email" 
          id="emailInput" 
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          name="password" 
          id="passwordInput" 
          className="form-control"/>
      </div>
      {errors}
      <button className="btn btn-primary">Sign up</button>
    </form>
  );
}

export default signUpPage;
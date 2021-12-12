import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';

const signOutPage = () => {
  const router = useRouter();
  const { performRequest, errors } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => router.push('/')
  });

  useEffect(() => {
    performRequest();
  }, []);

  return <div>Signing out...</div>;
}

export default signOutPage;
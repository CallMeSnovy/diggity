import axios from 'axios';
// import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import useSWR from 'swr';
import SideBar from '../../../components/SideBar';
import { Post, Sub } from '../../../types';
import { useAuthState } from '../../../context/auth';

export default function Submit() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { authenticated } = useAuthState();

  const router = useRouter();
  const { sub: subName } = router.query;

  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);
  if (error) router.push('/');

  const submitPost = async (event: FormEvent) => {
    event.preventDefault();

    if (title.trim() === '') return;

    if (!authenticated) router.push('/login');

    try {
      const { data: post } = await axios.post<Post>('/posts', {
        title: title.trim(),
        body,
        sub: sub.name,
      });
      router.push(`/r/${sub.name}/${post.identifier}/${post.slug}`);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="container flex pt-5">
      <Head>
        <title>Submit to Diggit</title>
      </Head>
      <div className="w-160">
        <div className="p-4 bg-white rounded">
          <h1 className="mb-3 text-lg">Submit a post to /r/{subName}</h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gray-600 focus:outline-none"
                placeholder="Title"
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div
                className="absolute mb-2 text-sm text-gray-500 select-none"
                style={{ top: 11, right: 10 }}
              >
                {title.trim().length}/300
              </div>
            </div>

            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Text (optional)"
              rows={4}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="px-3 py-1 blue button"
                type="submit"
                disabled={title.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {sub && <SideBar sub={sub} />}
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   try {
//     const cookie = req.headers.cookie;
//     if (!cookie) throw new Error('Missing auth token cookie');

//     await axios.get('/auth/me', { headers: { cookie } });
//     return { props: {} };
//   } catch (err) {
//     res.writeHead(307, { Location: '/login' }).end();
//   }
// };

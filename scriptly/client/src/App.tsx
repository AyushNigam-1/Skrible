import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './state/slice'
import { useQuery, gql, useLazyQuery, useMutation } from '@apollo/client'



export default function App() {
  const count = useSelector((state: any) => state.counter.value)
  const dispatch = useDispatch()


  // const [trigger, { loading, data, error }] = useLazyQuery(getAllScripts)
  // const [add, { data: addUserResponse }] = useMutation(addScript)
  // // console.log(addUserResponse)


  // const addScripts = () => {
  //   add({
  //     variables: {
  //       title: 'haha',
  //       language: 'Hindi',
  //       visibility: 'public',
  //     },
  //   })
  //     .then((response) => {
  //       console.log('Response:', response.data);
  //     })
  //     .catch((err) => {
  //       console.error('Error:', err);
  //     });
  // };

  return (
    <>
      {/* <button onClick={() => addScripts()} >Lolwa</button> */}
    </>
  )
}
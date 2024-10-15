import { useEffect } from "react"
import { useNavigate } from 'react-router-dom';

function Home(){

    const navigate = useNavigate();

    useEffect(()=>{
        navigate('/sign_in')
    },[])

    return(<h1>Welcome</h1>)
}
export default Home
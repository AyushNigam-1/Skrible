import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGOUT_MUTATION } from '../../graphql/mutation/userMutations';
import Loader from '../../components/Loader';

const Logout = () => {
    const navigate = useNavigate();
    const [logout, { loading, error }] = useMutation(LOGOUT_MUTATION, {
        onCompleted: () => { localStorage.removeItem("user"); navigate('/') }
    });

    useEffect(() => {
        logout();
    }, [logout]);

    return (
        <div className="flex justify-center items-center h-screen">
            {loading ? (
                <Loader />
            ) : error ? (
                <div className="text-red-500">Error logging out</div>
            ) : null}
        </div>
    );
};

export default Logout;

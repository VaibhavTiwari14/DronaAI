import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
   const [data, setData] = useState(undefined);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const fn = async(...args) => {
    setLoading(true);
    setError(null);

    try {
        const response = await cb(...args);
        setData(response);
        setError(null);
        setLoading(false); 
        return response;
    } catch (error) {
        setError(error);
        toast.error(error.message);
        setLoading(false);
        return { success: false, error: error.message };
    }
}

   return { data, loading, error, fn, setData }
}

export default useFetch;
import React from "react"
import { useParams } from "react-router-dom";

const GetPassword: React.FC = () => {
    const { id } = useParams();

    return (
        <h1>Get Password: {id}</h1>
    )
}

export { GetPassword }
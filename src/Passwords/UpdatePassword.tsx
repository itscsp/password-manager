import React from "react"
import { useParams } from "react-router-dom";

const UpdatePassword: React.FC = () => {
    const { id } = useParams();

    return (
        <h1>Update Password: {id}</h1>
    )
}

export { UpdatePassword }
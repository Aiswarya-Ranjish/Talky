import React, { useState, useEffect, useCallback } from "react";
import UserService from "../../../services/settings/User.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduTable from "../../../components/KiduTable";
import type { User } from "../../../types/settings/User.types";

const columns = [
    { label: "User ID", key: "userId" },
    { label: "User Name", key: "userName" },
    { label: "Company", key: "companyName" },
    { label: "Email", key: "userEmail" },
    { label: "Phone", key: "phoneNumber" },
];

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await UserService.getAll();
            console.log(response);

            if (response.isSucess && response.value) {
                setUsers(response.value);
                setError(null);
            } else {
                setError(response.customMessage || "Failed to fetch users");
            }
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return <KiduLoader type="users..." />;

    return (
        <KiduTable
            title="User Details"
            subtitle="List of all users with quick edit & view actions"
            data={users}
            columns={columns}
            addButtonLabel="Add New User"
            idKey="userId"
            addRoute="/dashboard/settings/create-user"
            editRoute="/dashboard/settings/edit-user"
            viewRoute="/dashboard/settings/view-user"
            error={error}
            onRetry={loadData}
        />
    );
};

export default UserList;

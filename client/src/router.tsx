import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "./layouts/AuthLayout";
import DraftLayout from "./layouts/DraftLayout";
import HomeLayout from "./layouts/HomeLayout";

const Login = lazy(() => import("./pages/auth/Login"));
const CreateAccount = lazy(() => import("./pages/auth/CreateAccount"));
const Logout = lazy(() => import("./pages/auth/Logout"));
const Explore = lazy(() => import("./pages/explore/Explore"));
const Favourites = lazy(() => import("./pages/favourites/Favourites"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Contributions = lazy(() => import("./pages/contributions/Contributions"));
// const UserContributions = lazy(() => import("./pages/UserContributions")); // Fixed the space in your import path
const ZenMode = lazy(() => import("./pages/zen/ZenMode"));
const Contribution = lazy(() => import("./pages/contribution/Contribution"));
const Timeline = lazy(() => import("./pages/timeline/Timeline"));
const Requests = lazy(() => import("./pages/requests/Requests"));
const Contributors = lazy(() => import("./pages/contributors/Contributors"));
const ScriptDetails = lazy(() => import("./pages/about/ScriptDetails"));
const DraftSettings = lazy(() => import("./pages/setting/DraftSettings"));

const PageLoader = () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
);

const Loadable = (Component: React.LazyExoticComponent<React.FC<any>>) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const user = localStorage.getItem("user");
    if (user) {
        return <Navigate to="/explore" replace />;
    }
    return <>{children}</>;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            { index: true, element: <Navigate to="/login" replace /> },
            { path: "/explore", element: Loadable(Explore) },
            { path: "/favourites", element: Loadable(Favourites) },
            { path: "/profile/:id", element: Loadable(Profile) },
            { path: "/contributions", element: Loadable(Contributions) },
            { path: "/zen/:id", element: Loadable(ZenMode) },
            { path: "/preview/:id/:paragraphId", element: Loadable(Contribution) },
            // { path: "/contributions/:draftId/:userId", element: Loadable(UserContributions) },
            {
                path: "/",
                element: <DraftLayout />,
                children: [
                    { path: "/timeline/:id", element: Loadable(Timeline) },
                    { path: "/requests/:id", element: Loadable(Requests) },
                    { path: "/contributors/:id", element: Loadable(Contributors) },
                    { path: "/about/:id", element: Loadable(ScriptDetails) },
                    { path: "/settings/:id", element: Loadable(DraftSettings) },
                ],
            },
        ],
    },
    {
        path: "/",
        element: (
            <PublicRoute>
                <AuthLayout />
            </PublicRoute>
        ),
        children: [
            { path: "/login", element: Loadable(Login) },
            { path: "/create-account", element: Loadable(CreateAccount) },
        ],
    },
    {
        path: "/logout",
        element: Loadable(Logout),
    },
]);
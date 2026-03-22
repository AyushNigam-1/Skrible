import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "./pages/auth/Layout";
import DraftLayout from "./pages/draft/Layout";
import HomeLayout from "./pages/home/Layout";

const Explore = lazy(() => import("./pages/home/Explore"));
const Favourites = lazy(() => import("./pages/home/Bookmarks"));
const Profile = lazy(() => import("./pages/home/Profile"));
const MyContributions = lazy(() => import("./pages/home/Contributions"));
const ZenMode = lazy(() => import("./pages/draft/ZenMode"));
const Contribution = lazy(() => import("./pages/home/Contribution"));
const UserContributions = lazy(() => import("./pages/home/UserContributions"));
const Timeline = lazy(() => import("./pages/draft/Timeline"));
const Requests = lazy(() => import("./pages/draft/Requests"));
const Contributors = lazy(() => import("./pages/draft/Contributors"));
const ScriptDetails = lazy(() => import("./pages/draft/About"));
const DraftSettings = lazy(() => import("./pages/draft/Settings"));
const Login = lazy(() => import("./pages/auth/Signin"));
const CreateAccount = lazy(() => import("./pages/auth/Signup"));


const PageLoader = () => (
    <div className="min-h-[50vh] w-full bg-transparent" />
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
            { path: "/bookmarks", element: Loadable(Favourites) },
            { path: "/profile/:id", element: Loadable(Profile) },
            { path: "/contributions", element: Loadable(MyContributions) },
            { path: "/zen/:id", element: Loadable(ZenMode) },
            { path: "/preview/:id/:paragraphId", element: Loadable(Contribution) },
            { path: "/contributions/:draftId/:userId", element: Loadable(UserContributions) },
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
]);
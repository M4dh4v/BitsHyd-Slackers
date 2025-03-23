import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Spinner, Flex, useToast } from "@chakra-ui/react";

/**
 * A wrapper component that protects routes, allowing access only to organizers
 * Redirects to login if not authenticated or to home if authenticated but not an organizer
 */
const OrganizerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // Show toast if user is logged in but not an organizer
    if (user && !user.organizer && !loading) {
      toast({
        title: "Access Denied",
        description: "Only organizers can access this page",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, loading, toast]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if user is not an organizer
  if (!user.organizer) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if user is an organizer
  return children;
};

export default OrganizerRoute;

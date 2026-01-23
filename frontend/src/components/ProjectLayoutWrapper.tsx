import { useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";

export default function ProjectLayoutWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, fetchProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [fetchProject, projectId]);

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <Outlet />;
}

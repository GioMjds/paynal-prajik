/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Edit, Eye, MapPin, Trash2 } from "lucide-react";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import EditAreaModal from "../../components/admin/EditAreaModal";
import Modal from "../../components/Modal";
import EventLoader from "../../motions/loaders/EventLoader";
import ManageSkeleton from "../../motions/skeletons/ManageSkeleton";
import {
  addNewArea,
  deleteArea,
  editArea,
  fetchAreas,
} from "../../services/Admin";
import { IArea as IEditArea } from "../../types/AreaAdmin";
import { AddAreaResponse, Area, PaginationData } from "../../types/AreaClient";
import Error from "../_ErrorBoundary";

const MemoizedImage = memo(({ src, alt, className }: { src: string, alt: string, className: string }) => {
  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      className={className}
    />
  );
});

MemoizedImage.displayName = 'MemoizedImage';

const AreaCard = memo(({
  area,
  index,
  onView,
  onEdit,
  onDelete
}: {
  area: Area;
  index: number;
  onView: (area: Area) => void;
  onEdit: (area: Area) => void;
  onDelete: (id: number) => void;
}) => {
  const areaImageProps = useMemo(() => ({
    src: area.area_image,
    alt: area.area_name
  }), [area.area_image, area.area_name]);

  const handleView = useCallback(() => onView(area), [area, onView]);
  const handleEdit = useCallback(() => onEdit(area), [area, onEdit]);
  const handleDelete = useCallback(() => onDelete(area.id), [area.id, onDelete]);

  if (!area) return null;

  return (
    <motion.div
      className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        damping: 12
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      <MemoizedImage
        src={areaImageProps.src}
        alt={areaImageProps.alt}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {area.area_name}
          </h2>
          <span className={`text-sm font-semibold ${area.status === 'available' ? 'text-green-600' : 'text-amber-600'
            } uppercase`}>
            {area.status === 'available' ? 'AVAILABLE' : 'MAINTENANCE'}
          </span>
        </div>
        <span className="flex items-center mb-2">
          <span className="inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold mr-2 bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Max Guests: {area.capacity}
          </span>
        </span>
        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
          {area.description || "No description provided."}
        </p>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">
            {area.price_per_hour.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <motion.button
              onClick={handleView}
              className="px-3 py-2 uppercase font-semibold bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye />
            </motion.button>
            <motion.button
              onClick={handleEdit}
              className="px-3 py-2 uppercase font-semibold bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit />
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="px-3 py-2 uppercase font-semibold bg-red-600 text-white rounded cursor-pointer hover:bg-red-700 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

AreaCard.displayName = 'AreaCard';

const ViewAreaModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  areaData: Area | null;
}> = ({ isOpen, onClose, areaData }) => {
  const areaImage = useMemo(() => {
    if (!areaData) return { src: "", alt: "" };
    return {
      src: areaData.area_image,
      alt: areaData.area_name
    };
  }, [areaData]);

  if (!areaData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
          >
            {/* Close button - positioned on top right */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white text-gray-700 hover:text-red-600 rounded-full p-2 transition-all duration-200 shadow-md cursor-pointer"
              whileTap={{ scale: 0.8 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Image with gradient overlay */}
              <div className="relative h-64 md:h-auto">
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="h-full"
                  >
                    <MemoizedImage
                      src={areaImage.src}
                      alt={areaImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute bottom-4 left-4 z-20 md:hidden">
                    <motion.h1
                      className="text-2xl font-bold text-white mb-1"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {areaData.area_name}
                    </motion.h1>
                    <motion.div
                      className="flex items-center"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${areaData.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {areaData.status === 'available' ? 'AVAILABLE' : 'MAINTENANCE'}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right Column: Area Information */}
              <div className="p-6 flex flex-col">
                <motion.div
                  className="hidden md:block mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold text-gray-900">{areaData.area_name}</h1>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${areaData.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {areaData.status === 'available' ? 'AVAILABLE' : 'MAINTENANCE'}
                    </span>
                  </div>
                </motion.div>

                {/* Description with a nice background */}
                <motion.div
                  className="bg-gray-50 p-4 rounded-lg mb-5 shadow-inner"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2">Description</h3>
                  <p className="text-gray-700">
                    {areaData.description || "No description available."}
                  </p>
                </motion.div>

                {/* Details in a grid */}
                <motion.div
                  className="grid grid-cols-2 gap-4 mb-6"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="block text-gray-500 text-sm">Maximum No. of Guests</span>
                    <div className="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xl font-bold text-gray-800">{areaData.capacity} <span className="text-sm font-normal text-gray-600">people</span></span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="block text-gray-500 text-sm">Price</span>
                    <div className="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xl font-bold text-gray-800">{areaData.price_per_hour.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Booking Info */}
                <motion.div
                  className="bg-indigo-50 p-4 rounded-lg mb-5"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm uppercase tracking-wider text-indigo-500 font-medium mb-2">Booking Information</h3>
                  <p className="text-gray-700 text-sm">
                    This venue is available for fixed hours (8:00 AM - 5:00 PM) and can be booked for
                    <span className="font-medium"> {areaData.price_per_hour.toLocaleString()}</span> per booking.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ManageAreas = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAreaData, setEditAreaData] = useState<IEditArea | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAreaData, setViewAreaData] = useState<Area | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteAreaId, setDeleteAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("");
  const queryClient = useQueryClient();

  const {
    data: areasResponse,
    isLoading,
    isError,
  } = useQuery<{
    data: Area[];
    pagination: PaginationData;
  }>({
    queryKey: ["areas", currentPage, pageSize],
    queryFn: fetchAreas,
  });

  const areas = areasResponse?.data || [];
  const pagination = areasResponse?.pagination;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.total_pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const addAreaMutation = useMutation<AddAreaResponse, unknown, FormData>({
    mutationFn: addNewArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Adding area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowFormModal(false);
      toast.success("Area added successfully!");

      setCurrentPage(1);
    },
    onError: (error: any) => {
      console.error(`Error adding area: ${error}`);
      toast.error(`Failed to add area.`);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const editAreaMutation = useMutation<
    AddAreaResponse,
    unknown,
    { areaId: number; formData: FormData }
  >({
    mutationFn: ({ areaId, formData }) => editArea(areaId, formData),
    onMutate: () => {
      setLoading(true);
      setLoaderText("Updating area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowFormModal(false);
      toast.success("Area updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update area: ${error.message || 'Unknown error'}`);
      console.error("Error updating area:", error);
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const deleteAreaMutation = useMutation<any, unknown, number>({
    mutationFn: deleteArea,
    onMutate: () => {
      setLoading(true);
      setLoaderText("Deleting area...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "areas"
      });
      setShowModal(false);

      if (areas.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    onSettled: () => {
      setLoading(false);
      setLoaderText("");
    },
  });

  const handleAddNew = () => {
    setEditAreaData(null);
    setShowFormModal(true);
  };

  const handleViewArea = useCallback((area: Area) => {
    setViewAreaData(area);
    setShowViewModal(true);
  }, []);

  const handleEditArea = useCallback((area: Area) => {
    setEditAreaData({
      id: area.id,
      area_name: area.area_name,
      area_image:
        typeof area.area_image === "string" ? area.area_image : area.area_image,
      description: area.description || "",
      capacity: area.capacity,
      price_per_hour: area.price_per_hour,
      status: area.status,
    });
    setShowFormModal(true);
  }, []);

  const handleDeleteArea = useCallback((areaId: number) => {
    setDeleteAreaId(areaId);
    setShowModal(true);
  }, []);

  const confirmDelete = () => {
    if (deleteAreaId != null) {
      deleteAreaMutation.mutate(deleteAreaId);
    }
  };

  const cancelDelete = () => {
    setDeleteAreaId(null);
    setShowModal(false);
  };

  const handleSave = async (areaData: IEditArea): Promise<void> => {
    const formData = new FormData();
    formData.append("area_name", areaData.area_name);
    formData.append("description", areaData.description || "");
    formData.append("capacity", areaData.capacity.toString());
    formData.append("price_per_hour", areaData.price_per_hour.toString());
    formData.append("status", areaData.status);

    if (areaData.area_image instanceof File) {
      formData.append("area_image", areaData.area_image);
    }

    try {
      if (!areaData.id) {
        await addAreaMutation.mutateAsync(formData);
      } else {
        await editAreaMutation.mutateAsync({ areaId: areaData.id, formData });
      }
    } catch (error) {
      console.error("Error saving area:", error);
      throw error;
    }
  };

  if (isLoading) return <ManageSkeleton type="area" />;
  if (isError) return <Error />;

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-[500]">
            <EventLoader text={loaderText} />
          </div>
        )}

        {/* Add New Area Button */}
        <div className="flex flex-row items-center mb-5 justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Manage Areas</h1>
            {pagination && (
              <p className="text-gray-500 mt-1">
                Total: {pagination.total_items} area{pagination.total_items !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <motion.button
            onClick={handleAddNew}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer font-semibold transition-colors duration-300"
            whileHover={{ scale: 1.05, backgroundColor: "#7c3aed" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            + Add New Area
          </motion.button>
        </div>

        {/* Areas Grid or Empty State */}
        {areas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas.map((area, index) => (
              <AreaCard
                key={area.id}
                area={area}
                index={index}
                onView={handleViewArea}
                onEdit={handleEditArea}
                onDelete={handleDeleteArea}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <MapPin className="w-16 h-16 text-gray-400 mb-4" />
            </motion.div>
            <motion.p
              className="text-2xl font-semibold"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              No Areas Found
            </motion.p>
            <motion.p
              className="mt-2 text-gray-500 text-center max-w-md"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              It looks like you haven't added any areas yet. Click the button
              below to create your first area.
            </motion.p>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-2 my-5">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.total_pages }).map((_, index) => {
                const pageNumber = index + 1;
                const isVisible =
                  pageNumber === 1 ||
                  pageNumber === pagination.total_pages ||
                  Math.abs(pageNumber - currentPage) <= 1;

                if (!isVisible) {
                  if (pageNumber === 2 || pageNumber === pagination.total_pages - 1) {
                    return <span key={`ellipsis-${pageNumber}`} className="px-3 py-1">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`w-8 h-8 rounded-full ${currentPage === pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-blue-100"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={pagination && currentPage === pagination.total_pages}
              className={`p-2 rounded-full ${pagination && currentPage === pagination.total_pages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Edit/Add Area Modal */}
        {showFormModal && (
          <AnimatePresence mode="wait">
            <EditAreaModal
              isOpen={showFormModal}
              cancel={() => setShowFormModal(false)}
              onSave={handleSave}
              areaData={editAreaData}
              loading={addAreaMutation.isPending || editAreaMutation.isPending}
            />
          </AnimatePresence>
        )}

        {/* View Area Modal */}
        <ViewAreaModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          areaData={viewAreaData}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showModal}
          icon="fas fa-trash"
          title="Delete Area"
          description="Are you sure you want to delete this area?"
          cancel={cancelDelete}
          onConfirm={confirmDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md uppercase font-bold hover:bg-red-700 transition-all duration-300"
          cancelText="No"
          confirmText="Delete Area"
        />
      </div>
    </div>
  );
};

export default ManageAreas;
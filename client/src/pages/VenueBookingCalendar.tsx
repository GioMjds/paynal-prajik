import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isSameDay, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchAreaById } from '../services/Booking';

interface AreaData {
    id: number;
    area_name: string;
    description: string;
    area_image: string;
    status: string;
    capacity: number;
    price_per_hour: string;
}

interface UnavailableTime {
    start_time: string;
    end_time: string;
}

const VenueBookingCalendar = () => {
    const { areaId } = useParams<{ areaId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const arrivalParam = searchParams.get("arrival");

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<string>('');
    const [selectedEndTime, setSelectedEndTime] = useState<string>('');
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);
    const [duration, setDuration] = useState<number>(1); // Duration in hours
    const [price, setPrice] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (arrivalParam) {
            try {
                const parsedDate = parseISO(arrivalParam);
                setSelectedDate(parsedDate);
                setCurrentMonth(parsedDate);
                fetchUnavailableTimes(parsedDate);
            } catch (error) {
                console.error('Error parsing arrival date from URL:', error);
            }
        }
    }, [arrivalParam]);

    // Fetch area data
    const { data: areaData, isLoading: isLoadingArea } = useQuery<AreaData>({
        queryKey: ['area', areaId],
        queryFn: async () => {
            console.log(`Fetching area details for ID: ${areaId}`);
            try {
                const data = await fetchAreaById(areaId || '');
                console.log('Area data received:', data);
                return data;
            } catch (error) {
                console.error('Error fetching area:', error);
                throw error;
            }
        },
        enabled: !!areaId
    });

    // Mock function to fetch unavailable times - replace with actual API call
    const fetchUnavailableTimes = async (date: Date) => {
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');

            // This is where you would make an API call to get booked time slots for this date and area
            // For example:
            // const response = await booking.get(`/area-bookings/${areaId}`, {
            //   params: { date: formattedDate },
            //   withCredentials: true
            // });
            // setUnavailableTimes(response.data.unavailableTimes);

            // For now, let's use mock data for demonstration
            console.log(`Fetching unavailable times for ${formattedDate} and area ${areaId}`);

            const mockUnavailableTimes: UnavailableTime[] = [
                { start_time: '10:00', end_time: '12:00' },
                { start_time: '15:30', end_time: '17:30' }
            ];
            setUnavailableTimes(mockUnavailableTimes);
        } catch (error) {
            console.error('Error fetching unavailable times:', error);
            setErrorMessage('Failed to load booked time slots. Some times may not be available.');
        }
    };

    useEffect(() => {
        if (areaData) {
            const hourlyPrice = Number(areaData.price_per_hour.replace(/[^\d.]/g, ''));
            setPrice(hourlyPrice * duration);
        }
    }, [areaData, duration]);

    // Handle duration change
    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDuration(Number(e.target.value));
        // Auto-calculate end time based on selected start time and duration
        if (selectedStartTime) {
            const [hour, minute] = selectedStartTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hour, minute, 0, 0);
            const endDate = new Date(startDate.getTime() + Number(e.target.value) * 60 * 60 * 1000);
            const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
            setSelectedEndTime(newEndTime);

            // Validate if the new time range overlaps with unavailable times
            validateTimeSelection(selectedStartTime, newEndTime);
        }
    };

    // Validate if selected time overlaps with unavailable times
    const validateTimeSelection = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return;

        // Convert selected times to comparable format (minutes since midnight)
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const selectionStartMinutes = startHour * 60 + startMinute;
        const selectionEndMinutes = endHour * 60 + endMinute;

        // Check if selection overlaps with any unavailable time slot
        const overlaps = unavailableTimes.some(slot => {
            const [unavailStartHour, unavailStartMinute] = slot.start_time.split(':').map(Number);
            const [unavailEndHour, unavailEndMinute] = slot.end_time.split(':').map(Number);

            const unavailStartMinutes = unavailStartHour * 60 + unavailStartMinute;
            const unavailEndMinutes = unavailEndHour * 60 + unavailEndMinute;

            // Check for overlap
            return (
                (selectionStartMinutes < unavailEndMinutes && selectionEndMinutes > unavailStartMinutes) ||
                (unavailStartMinutes < selectionEndMinutes && unavailEndMinutes > selectionStartMinutes)
            );
        });

        if (overlaps) {
            setErrorMessage('Selected time conflicts with an existing booking. Please choose another time.');
        } else {
            setErrorMessage(null);
        }
    };

    // Handle start time change
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStartTime = e.target.value;
        setSelectedStartTime(newStartTime);

        // Auto-calculate end time based on selected start time and duration
        if (newStartTime) {
            const [hour, minute] = newStartTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hour, minute, 0, 0);
            const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
            const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
            setSelectedEndTime(newEndTime);

            // Validate the time selection
            validateTimeSelection(newStartTime, newEndTime);
        }
    };

    const months = [currentMonth, addMonths(currentMonth, 1)];

    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const isDateUnavailable = (date: Date) => {
        // Only consider dates before today as unavailable
        if (isBefore(date, startOfDay(new Date()))) {
            return true;
        }

        // Additional logic for unavailable dates can be added here
        return false;
    };

    const handleDateClick = (date: Date) => {
        if (isDateUnavailable(date)) {
            return;
        }
        setSelectedDate(date);
        fetchUnavailableTimes(date);
    };

    const handleDateHover = (date: Date) => {
        if (!isDateUnavailable(date)) {
            setHoveredDate(date);
        }
    };

    const getDateCellClass = (date: Date) => {
        const isUnavailable = isDateUnavailable(date);
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isHovered = hoveredDate && isSameDay(date, hoveredDate);
        const isToday = isSameDay(date, new Date());

        let className = "h-10 w-10 flex items-center justify-center text-sm";

        if (isUnavailable) {
            className += " bg-gray-400 text-gray-100 cursor-not-allowed";
        } else if (isSelected) {
            className += " bg-blue-600 text-white cursor-pointer";
        } else if (isHovered) {
            className += " bg-blue-100 border border-blue-300 cursor-pointer";
        } else {
            className += " bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer";
        }

        if (isToday && !isSelected && !isUnavailable) {
            className += " border-blue-500 border-2";
        }

        return className;
    };

    // Generate time slots from 7 AM to 10 PM
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour <= 22; hour++) {
            const formattedHour = hour.toString().padStart(2, '0');
            slots.push(`${formattedHour}:00`);
            if (hour < 22) { // Don't add half-hour for the last hour
                slots.push(`${formattedHour}:30`);
            }
        }
        return slots;
    };

    // Filter time slots based on unavailable times
    const getAvailableTimeSlots = () => {
        const allSlots = generateTimeSlots();

        // If we're not using unavailable times yet, return all slots
        if (unavailableTimes.length === 0) return allSlots;

        return allSlots.filter(timeSlot => {
            // Check if this start time would result in an overlap
            const [hour, minute] = timeSlot.split(':').map(Number);
            const startMinutes = hour * 60 + minute;
            const endMinutes = startMinutes + (duration * 60);

            // Check against all unavailable times
            return !unavailableTimes.some(slot => {
                const [unavailStartHour, unavailStartMinute] = slot.start_time.split(':').map(Number);
                const [unavailEndHour, unavailEndMinute] = slot.end_time.split(':').map(Number);

                const unavailStartMinutes = unavailStartHour * 60 + unavailStartMinute;
                const unavailEndMinutes = unavailEndHour * 60 + unavailEndMinute;

                // Check for overlap
                return (startMinutes < unavailEndMinutes && endMinutes > unavailStartMinutes);
            });
        });
    };

    const availableTimeSlots = getAvailableTimeSlots();

    const handleProceed = () => {
        if (selectedDate && selectedStartTime && selectedEndTime) {
            // Do a final validation
            if (errorMessage) {
                return; // Don't proceed if there's an error
            }

            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const startTime = `${dateStr}T${selectedStartTime}:00`;
            const endTime = `${dateStr}T${selectedEndTime}:00`;
            const totalPrice = price;

            navigate(`/confirm-venue-booking?areaId=${areaId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&totalPrice=${totalPrice}`);
        }
    };

    if (isLoadingArea) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <h2 className="text-4xl font-semibold mb-6 text-center">Book Your Venue</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4">Select Your Booking Date & Time</h3>

                        {/* Selected Date & Time */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <span className="text-gray-600">Selected Date:</span>
                                <span className="ml-2 font-semibold">
                                    {selectedDate ? format(selectedDate, 'EEE, MMM dd, yyyy') : 'Select a date'}
                                </span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="text-gray-600">Time Slot:</span>
                                <span className="ml-2 font-semibold">
                                    {selectedStartTime && selectedEndTime
                                        ? `${selectedStartTime} - ${selectedEndTime}`
                                        : 'Select time'}
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {arrivalParam ? (
                            // If we have arrival date from URL, focus on time selection
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-800">
                                    Date pre-selected: {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Please select your preferred time and duration below.
                                </p>
                            </div>
                        ) : (
                            // Show calendar for date selection if no arrival date in URL
                            <>
                                {/* Calendar Controls */}
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        onClick={prevMonth}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="text-lg font-semibold">
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </div>
                                    <button
                                        onClick={nextMonth}
                                        className="p-2 rounded-full hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {months.map((month, monthIndex) => {
                                        const monthStart = startOfMonth(month);
                                        const monthEnd = endOfMonth(month);
                                        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

                                        // Get the weekday index of the first day (0 for Sunday, 1 for Monday, etc.)
                                        const startWeekday = monthStart.getDay();

                                        // Create an array of days including empty spots for proper alignment
                                        const calendarDays = [];

                                        // Add empty slots for days of the week before the first day of the month
                                        for (let i = 0; i < startWeekday; i++) {
                                            calendarDays.push(null);
                                        }

                                        // Add the actual days of the month
                                        calendarDays.push(...days);

                                        return (
                                            <div key={monthIndex}>
                                                <div className="text-center font-medium mb-2">
                                                    {format(month, 'MMMM yyyy')}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {/* Weekday headers */}
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {/* Calendar days */}
                                                    {calendarDays.map((day, i) => (
                                                        <div key={i} className="h-10 flex items-center justify-center">
                                                            {day ? (
                                                                <div
                                                                    className={getDateCellClass(day)}
                                                                    onClick={() => handleDateClick(day)}
                                                                    onMouseEnter={() => handleDateHover(day)}
                                                                    onMouseLeave={() => setHoveredDate(null)}
                                                                >
                                                                    {format(day, 'd')}
                                                                </div>
                                                            ) : (
                                                                <div></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Time Selection */}
                        <div className={`${selectedDate ? 'block' : 'hidden'} mb-8`}>
                            <h4 className="font-semibold text-lg mb-4">Select Time & Duration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <select
                                        value={selectedStartTime}
                                        onChange={handleStartTimeChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select start time</option>
                                        {availableTimeSlots.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {unavailableTimes.length > 0 && availableTimeSlots.length < generateTimeSlots().length && (
                                        <p className="text-xs text-orange-700 mt-1">
                                            Some time slots are not available due to existing bookings.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                                    <select
                                        value={duration}
                                        onChange={handleDurationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                                            <option key={hours} value={hours}>
                                                {hours} {hours === 1 ? 'hour' : 'hours'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time (auto-calculated)</label>
                                    <input
                                        type="text"
                                        value={selectedEndTime}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Unavailable Times Display */}
                        {selectedDate && unavailableTimes.length > 0 && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <h4 className="font-medium text-yellow-800 mb-2">Already Booked Time Slots</h4>
                                <ul className="list-disc list-inside">
                                    {unavailableTimes.map((slot, index) => (
                                        <li key={index} className="text-yellow-700">
                                            {slot.start_time} - {slot.end_time}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Calendar Legend - only show if calendar is visible */}
                        {!arrivalParam && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="text-sm font-medium mb-3">LEGEND</h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 bg-white border border-gray-300 mr-2"></div>
                                        <span className="text-sm">Available Date</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 bg-blue-600 mr-2"></div>
                                        <span className="text-sm">Selected Date</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 bg-gray-400 mr-2"></div>
                                        <span className="text-sm">Unavailable Date</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 border-2 border-blue-500 bg-white mr-2"></div>
                                        <span className="text-sm">Today</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-6 w-6 bg-blue-100 border border-blue-300 mr-2"></div>
                                        <span className="text-sm">Hovered Date</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Proceed Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleProceed}
                                disabled={!selectedDate || !selectedStartTime || !selectedEndTime || !!errorMessage}
                                className={`px-6 py-2 rounded-md font-semibold ${selectedDate && selectedStartTime && selectedEndTime && !errorMessage
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Area Info (1/3 width on large screens) */}
                <div className="lg:col-span-1">
                    {areaData && (
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <div className="mb-4">
                                <img
                                    loading='lazy'
                                    src={areaData.area_image}
                                    alt={areaData.area_name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{areaData.area_name}</h3>
                            <div className="flex items-center mb-2">
                                <span className={`px-2 py-1 ${areaData.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    } text-sm font-medium rounded-full`}>
                                    {areaData.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mb-3">{areaData.price_per_hour} / hour</p>

                            <div className="flex items-center text-gray-600 mb-3">
                                <span className="mr-2">👥</span>
                                <span>Capacity: {areaData.capacity} pax</span>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-gray-700 text-sm">{areaData.description || "No description available."}</p>
                            </div>

                            {selectedDate && selectedStartTime && selectedEndTime && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <h4 className="font-medium mb-2">Your Selection</h4>
                                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Date:</span>
                                            <span className="font-medium">{format(selectedDate, 'EEE, MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Time:</span>
                                            <span className="font-medium">{selectedStartTime} - {selectedEndTime}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Duration:</span>
                                            <span className="font-medium">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold text-blue-600 pt-2 border-t border-gray-200">
                                            <span>Total Price:</span>
                                            <span>₱{price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueBookingCalendar; 

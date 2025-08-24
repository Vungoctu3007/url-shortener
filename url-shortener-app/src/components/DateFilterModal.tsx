// components/DateFilterModal.tsx
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply: (from: Date, to: Date) => void;
}

const DateFilterModal: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-gray-900 mb-4"
                                >
                                    Filter by created date
                                </Dialog.Title>

                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    Or by custom date range:
                                </div>
                                <div className="flex gap-3 mb-4">
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date) => date && setFromDate(date)}
                                        selectsStart
                                        startDate={fromDate}
                                        endDate={toDate}
                                        className="border px-3 py-2 rounded-md w-full"
                                    />
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date) => date && setToDate(date)}
                                        selectsEnd
                                        startDate={fromDate}
                                        endDate={toDate}
                                        className="border px-3 py-2 rounded-md w-full"
                                    />
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <button
                                        onClick={onClose}
                                        className="text-sm text-gray-600 hover:underline"
                                    >
                                        × Clear filter
                                    </button>
                                    <button
                                        onClick={() => {
                                            onApply(fromDate, toDate);
                                            onClose();
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DateFilterModal;

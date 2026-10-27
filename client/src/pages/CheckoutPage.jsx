import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  Film,
  Clock,
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi.js';
import { formatPrice, formatDate, formatTime } from '../utils/format.js';
import HoldTimer from '../components/HoldTimer.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverOffsetMs] = useState(0);

  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [holdExpired, setHoldExpired] = useState(false);


  // Validate ObjectId format
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId || '');

  // 1. Fetch Booking Details
  const fetchBooking = useCallback(async () => {
    if (!isValidObjectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await bookingApi.getBooking(bookingId);
      const b = res?.data;

      if (!b) {
        setError('Booking not found');
        return;
      }

      // Check statuses
      if (b.status === 'confirmed') {
        navigate(`/booking/${b._id}/confirmation`, { replace: true });
        return;
      }

      if (b.status === 'cancelled') {
        setError('This booking was cancelled.');
        return;
      }

      if (b.status === 'expired') {
        setHoldExpired(true);
        return;
      }

      // Check if hold is already past
      if (new Date(b.holdExpiresAt) <= new Date()) {
        setHoldExpired(true);
        return;
      }

      setBooking(b);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Not authorised to access this booking');
      } else if (err.response?.status === 404) {
        setError('Booking not found');
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, isValidObjectId, navigate]);

  useEffect(() => {
    document.title = 'Demo Booking — IMovies';
    if (isValidObjectId) {
      fetchBooking();
    }
  }, [isValidObjectId, fetchBooking]);

  // Timer Expiration Callback
  const handleTimerExpire = useCallback(() => {
    setHoldExpired(true);
    toast.warn('Your seat hold has expired. Please reselect your seats.');
  }, []);

  // Confirm the demo booking on the server. This reserves seats but does not collect money.
  const handleConfirmDemoBooking = async () => {
    if (!booking || confirmingBooking || holdExpired) return;

    setConfirmingBooking(true);
    try {
      await bookingApi.confirmDemoBooking(booking._id);
      toast.success('Demo booking confirmed — no payment was collected.');
      navigate(`/booking/${booking._id}/confirmation`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not confirm demo booking.');
      if (err.response?.status === 410) setHoldExpired(true);
    } finally {
      setConfirmingBooking(false);
    }
  };

  // Release Seats & Go Back
  const handleReleaseAndBack = async () => {
    if (!window.confirm('Are you sure you want to release these seats and return?')) {
      return;
    }

    try {
      await bookingApi.releaseHold(booking._id);
      toast.info('Seats released.');
      navigate(`/shows/${booking.show?._id || ''}/seats`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Invalid ObjectId param guard
  if (!isValidObjectId) {
    return (
      <div className="py-16">
        <ErrorState
          title="Invalid Booking ID"
          message="The booking reference format is invalid."
        />
        <div className="text-center mt-6">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to movies
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-neutral-400 animate-pulse">
        Loading demo booking summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorState title="Checkout Error" message={error} />
        <div className="text-center mt-6">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to movies
          </Link>
        </div>
      </div>
    );
  }

  // Hold Expired State View
  if (holdExpired) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Seat Hold Has Expired</h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Your temporary seat hold expired and the seats have been released. Please select seats again to make a demo booking.
        </p>
        <div>
          <Link
            to={`/shows/${booking?.show?._id || ''}/seats`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-rose-950/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Select Available Seats
          </Link>
        </div>
      </div>
    );
  }

  const show = booking?.show;
  const movie = show?.movie;
  const theatre = show?.theatre;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Demo Booking Checkout</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Booking ID: <code className="text-neutral-300 font-mono">{booking._id}</code>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Time remaining:</span>
          <HoldTimer
            expiresAt={booking.holdExpiresAt}
            serverOffsetMs={serverOffsetMs}
            onExpire={handleTimerExpire}
          />
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-24 sm:w-32 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md">
            {movie?.poster ? (
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                <Film className="w-8 h-8 text-neutral-600" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">{movie?.title}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {theatre?.name} • {theatre?.city} • {show?.screenName}
              </p>
              <p className="text-xs text-neutral-400">
                {formatDate(show?.startTime)} at {formatTime(show?.startTime)}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <span className="text-xs font-semibold text-neutral-400 block mb-1.5">
                Reserved Seats ({booking.seats.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {booking.seats.map((seatLabel) => (
                  <span
                    key={seatLabel}
                    className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-bold text-rose-400"
                  >
                    {seatLabel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Ticket Base Amount ({booking.seats.length} seats)</span>
            <span>{formatPrice(booking.amount)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Online payment</span>
            <span className="text-emerald-400 font-medium">Not used</span>
          </div>

          <div className="flex justify-between items-center text-lg font-extrabold text-white pt-3 border-t border-neutral-800">
            <span>Grand Total</span>
            <span className="text-amber-400 text-xl font-bold">{formatPrice(booking.amount)}</span>
          </div>
        </div>

        {/* Demo mode notice */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-xs text-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span><strong>Demo mode:</strong> this confirms a sample booking for project demonstration only. No payment will be collected and this is not a paid cinema ticket.</span>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            disabled={confirmingBooking || holdExpired}
            onClick={handleConfirmDemoBooking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-bold text-sm text-neutral-950 shadow-xl shadow-amber-950/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{confirmingBooking ? 'Confirming Demo Booking...' : `Confirm Demo Booking · ${formatPrice(booking.amount)}`}</span>
          </button>

          <button
            type="button"
            disabled={confirmingBooking}
            onClick={handleReleaseAndBack}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Release seats and go back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

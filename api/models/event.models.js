import mongoose from 'mongoose';
import validator from 'validator';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  color: {
    type: String,
    required: true,
    enum: {
      values: ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'],
      message: '{VALUE} is not a valid color'
    },
    default: 'bg-blue-500'
  },
  meetingLink: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return validator.isURL(v, {
          protocols: ['http', 'https'],
          require_protocol: true
        });
      },
      message: props => `${props.value} is not a valid URL`
    },
    trim: true,
    lowercase: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
eventSchema.index({ date: 1 });
eventSchema.index({ createdBy: 1, date: 1 });

// Virtual property
eventSchema.virtual('time').get(function() {
  return this.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// Middleware
eventSchema.pre('save', function(next) {
  if (this.isRecurring && !this.recurrencePattern) {
    this.recurrencePattern = 'daily';
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
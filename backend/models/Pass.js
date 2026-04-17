const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [50, 'Source cannot exceed 50 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [50, 'Destination cannot exceed 50 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['1-month', '3-months', '6-months', '1-year'],
    default: '1-month'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  passNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  qrCode: {
    type: String
  },
  remarks: {
    type: String,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  // Payment Fields
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'failed'],
    default: 'unpaid'
  },
  transactionId: {
    type: String,
    sparse: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'cod'],
    default: 'razorpay'
  }
}, {
  timestamps: true
});

// Generate pass number before saving if approved
passSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.passNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.passNumber = `TP${year}${random}`;
    
    // Set expiry date based on duration
    const approvedDate = new Date();
    this.approvedDate = approvedDate;
    
    switch(this.duration) {
      case '1-month':
        this.expiryDate = new Date(approvedDate.setMonth(approvedDate.getMonth() + 1));
        break;
      case '3-months':
        this.expiryDate = new Date(approvedDate.setMonth(approvedDate.getMonth() + 3));
        break;
      case '6-months':
        this.expiryDate = new Date(approvedDate.setMonth(approvedDate.getMonth() + 6));
        break;
      case '1-year':
        this.expiryDate = new Date(approvedDate.setFullYear(approvedDate.getFullYear() + 1));
        break;
    }
  }
  next();
});

// Index for better query performance
passSchema.index({ userId: 1, status: 1 });
passSchema.index({ status: 1, applicationDate: -1 });
passSchema.index({ passNumber: 1 });

module.exports = mongoose.model('Pass', passSchema);

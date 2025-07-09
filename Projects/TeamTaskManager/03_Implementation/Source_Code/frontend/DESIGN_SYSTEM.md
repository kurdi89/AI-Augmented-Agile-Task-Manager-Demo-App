# Team Task Manager - Design System

## 🎨 **Brand Identity**

### **Primary Color: Indigo (#4F46E5)**
- **Hex**: `#4F46E5`
- **RGB**: `79, 70, 229`
- **HSL**: `242, 84%, 59%`

**Why Indigo?**
- **Professional**: Conveys trust, reliability, and professionalism
- **Modern**: Contemporary and tech-forward appearance
- **Accessible**: Good contrast ratios for accessibility
- **Versatile**: Works well across different contexts and states

### **Color Palette**

#### **Primary Colors**
```css
--indigo-50: #EEF2FF
--indigo-100: #E0E7FF
--indigo-200: #C7D2FE
--indigo-300: #A5B4FC
--indigo-400: #818CF8
--indigo-500: #6366F1  /* Main brand color */
--indigo-600: #4F46E5  /* Primary buttons, links */
--indigo-700: #4338CA
--indigo-800: #3730A3
--indigo-900: #312E81
```

#### **Neutral Colors**
```css
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

#### **Status Colors**
```css
--success-50: #F0FDF4
--success-500: #22C55E
--success-600: #16A34A

--warning-50: #FFFBEB
--warning-500: #F59E0B
--warning-600: #D97706

--error-50: #FEF2F2
--error-500: #EF4444
--error-600: #DC2626

--info-50: #EFF6FF
--info-500: #3B82F6
--info-600: #2563EB
```

## 📐 **Typography**

### **Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### **Font Sizes**
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
```

### **Font Weights**
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## 📏 **Spacing System**

### **Spacing Scale**
```css
--space-xs: 0.25rem   /* 4px */
--space-sm: 0.5rem    /* 8px */
--space-md: 1rem      /* 16px */
--space-lg: 1.5rem    /* 24px */
--space-xl: 2rem      /* 32px */
--space-2xl: 3rem     /* 48px */
--space-3xl: 4rem     /* 64px */
```

## 🔲 **Border Radius**

```css
--radius-sm: 0.25rem   /* 4px */
--radius-md: 0.375rem  /* 6px */
--radius-lg: 0.5rem    /* 8px */
--radius-xl: 0.75rem   /* 12px */
--radius-2xl: 1rem     /* 16px */
--radius-full: 9999px
```

## 🌫️ **Shadows**

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

## 🧩 **Component Styles**

### **Authentication Pages**
```css
/* Container */
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Card */
.auth-card {
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  background: white;
  border-radius: 0.75rem;
}

/* Buttons */
.btn-primary {
  width: 100%;
  background: #4F46E5;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #4338CA;
}

.btn-secondary {
  width: 100%;
  border: 1px solid #C7D2FE;
  color: #4F46E5;
  background: transparent;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #EEF2FF;
}
```

### **Dashboard**
```css
/* Header */
.dashboard-header {
  background: white;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border-bottom: 1px solid #E5E7EB;
}

/* Cards */
.dashboard-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid #E5E7EB;
}

/* Buttons */
.dashboard-btn-primary {
  background: #4F46E5;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.dashboard-btn-primary:hover {
  background: #4338CA;
}
```

## 🎯 **Usage Guidelines**

### **Primary Color Usage**
- **Buttons**: Primary actions, CTAs
- **Links**: Navigation and interactive elements
- **Icons**: Primary brand icons
- **Accents**: Highlighting important information

### **Color Combinations**
- **Primary + White**: High contrast, primary actions
- **Primary + Gray**: Secondary actions, subtle interactions
- **Gray + White**: Backgrounds, cards, containers
- **Status Colors**: Success, warning, error states

### **Accessibility**
- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Information not conveyed by color alone
- **Focus States**: Clear focus indicators for keyboard navigation

## 📱 **Responsive Design**

### **Breakpoints**
```css
--sm: 640px
--md: 768px
--lg: 1024px
--xl: 1280px
--2xl: 1536px
```

### **Mobile First**
- Start with mobile layouts
- Scale up for larger screens
- Maintain touch-friendly targets (44px minimum)

## 🔄 **Animation & Transitions**

### **Duration**
```css
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 350ms
```

### **Easing**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## 📋 **Implementation**

### **CSS Variables**
All design tokens are available as CSS custom properties for easy theming and maintenance.

### **Component Library**
The design system is implemented through reusable React components with consistent styling.

### **Documentation**
This design system serves as the single source of truth for all visual design decisions across the application.

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Maintained By**: Team Task Manager Development Team 
# Messaging UI - Visual Layout

## Desktop View

```
┌──────────────────────────────────────────────────────────────────┐
│                         OfficeApp                                │  ← Header with nav
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌────────────────────────────────────────┐   │
│  │ Chats       │  │  Sarah Johnson (Sales Manager)         │   │
│  │             │  │  sarah.johnson@company.com             │   │
│  │ Search... ⌕ │  ├────────────────────────────────────────┤   │
│  │             │  │                                        │   │
│  │ John Smith  │  │           Hello! How are you?          │   │
│  │ Last seen 2m │  │                                    3:45 PM  │
│  │             │  │                                        │   │
│  │ Mike (IT)   │  │  I'm doing great, thanks for asking   │   │
│  │ New message │  │                                    3:46 PM  │
│  │             │  │     Let's catch up later today        │   │
│  │ HR Team     │  │                                    3:47 PM  │
│  │ Last msg 1h │  │                                        │   │
│  │             │  │           Sure! Talk then              │   │
│  │             │  │                                    3:48 PM  │
│  │             │  │ Type message here...            [Send] │   │
│  │             │  │                                        │   │
│  │             │  │                                        │   │
│  └─────────────┘  └────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Header (Chat Info)
- **Background:** Purple gradient (#667eea to #764ba2)
- **Text:** White
- **Layout:** Name (large, 20px) + Email (small, 13px)

### Messages - Sent by You
- **Background:** Purple (#667eea)
- **Text:** White
- **Position:** Right-aligned
- **Shape:** Rounded corners (18px) with 4px sharp corner on bottom-right
- **Time:** Small gray text on right

### Messages - Received
- **Background:** Light Gray (#e0e0e0)
- **Text:** Dark (#333)
- **Position:** Left-aligned
- **Shape:** Rounded corners (18px) with 4px sharp corner on bottom-left
- **Time:** Small gray text on left

### Input Area
- **Textarea:** 
  - Rounded border (20px radius)
  - Gray border (#ddd), blue on focus (#667eea)
  - Grows from 44px up to 120px max
  - Placeholder: "Type your message here..."
  
- **Send Button:**
  - Purple background (#667eea)
  - White text
  - Rounded pill shape (20px radius)
  - 44px height, 70px width min
  - Hover: Darker purple with shadow

---

## Layout Behavior

### Header
```
┌─────────────────────────────────────┐
│ Sarah Johnson                        │  ← Always visible
│ sarah.johnson@company.com            │  ← Never scrolls
└─────────────────────────────────────┘
```
✅ Sticky at top  
✅ Shows contact info  
✅ Easy to see who you're chatting with

### Messages
```
┌─────────────────────────────────────┐
│ You: "Hello!"              3:45 PM   │
│                                     │
│ Them: "Hi there!"          3:46 PM  │  ← Scrollable area
│                                     │
│ You: "How are you?"        3:47 PM  │
│                                     │
│ Them: "Great! You?"        3:48 PM  │
└─────────────────────────────────────┘
```
✅ Automatic scrolling  
✅ New messages appear at bottom  
✅ Each message with timestamp

### Input Area
```
┌─────────────────────────────────────┐
│ [Type message...             ] [Send]│  ← Always visible
└─────────────────────────────────────┘
```
✅ Sticky at bottom  
✅ Ready to type  
✅ Send button always accessible

---

## Empty Conversation State

When no conversation is selected:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                 Select a conversation                      │
│            or search for contacts to start chatting       │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Gradient background (blue to teal)
- Centered message
- Ready to accept selection

---

## Responsive Behavior

### Tablet / Smaller Screens
- Message max-width increases to 80%
- Padding reduces slightly
- All elements remain accessible
- Input button stays visible

### Features Across Devices
✅ Touch-friendly button sizes (44px minimum)  
✅ Proper spacing for thumbs  
✅ No horizontal scroll needed  
✅ Messages wrap properly  

---

## Message Animation

When messages appear:
```
Initial:  Opacity: 0%, Y: +10px
          ↓ 0.3 seconds animation
Final:    Opacity: 100%, Y: 0px
```
- Smooth slide-up effect
- Makes messages feel natural
- Not jarring

---

## Interaction States

### Focus States
- Textarea: Blue border + subtle shadow
- Better UX, clear visual feedback

### Hover States
- Send Button: Darker blue + shadow
- Conversation Items: Light gray background
- Clear feedback that element is clickable

### Active States
- Send Button: Slight scale down (0.95)
- Feels responsive to click
- No lag perception

---

## Typography

| Element | Font Size | Weight | Color |
|---------|-----------|--------|-------|
| Header Name | 20px | Bold | White |
| Header Email | 13px | Normal | White 90% opacity |
| Message Content | 15px | Normal | White (sent), #333 (recv) |
| Message Time | 12px | Normal | #999 |
| Placeholder | 15px | Normal | #999 |

---

## Spacing

| Element | Padding | Margin | Gap |
|---------|---------|--------|-----|
| Header | 20px | 0 | - |
| Messages | 20px | - | 10px |
| Input Area | 15px 20px | - | 12px (gap) |
| Message Content | 12px 16px | - | - |

---

## Browser Features Used

✅ CSS Flexbox - for perfect alignment  
✅ CSS Grid - for responsive layout  
✅ CSS Animations - for smooth transitions  
✅ CSS Gradients - for beautiful headers  
✅ CSS Media Queries - for responsiveness  
✅ CSS Focus States - for accessibility  

---

## Testing the Layout

1. **Start a conversation** → See header at top
2. **Scroll through messages** → Header stays fixed
3. **Type a message** → Input stays at bottom
4. **Send message** → Appears on right in blue
5. **Receive message** → Appears on left in gray
6. **Resize window** → Layout adapts smoothly

---

**Final Result:** Clean, modern, WhatsApp-style messaging interface  
**Date:** January 17, 2026

# Utils Directory

This directory contains utilities for the AI Knowledge Sharing Interface.

## Session Content

The application requires the `session-one.Rmd` file to function properly. There are two ways to provide this file:

### Option 1: Copy the file to this directory

The simplest approach is to copy the `session-one.Rmd` file directly into this directory:

```
/realtime-chat-interface/utils/session-one.Rmd
```

### Option 2: Use the original file location

Alternatively, you can keep the file in its original location:

```
/AI-Knowledge-Sharing/session-one/session-one.Rmd
```

The application will automatically look for the file in multiple locations.

## Troubleshooting

If you see an error like "Could not find session-one.Rmd file!", make sure the file exists in one of the following locations:

1. `/realtime-chat-interface/utils/session-one.Rmd`
2. `/AI-Knowledge-Sharing/session-one/session-one.Rmd`
3. `/realtime-chat-interface/session-one.Rmd`

The application will use a simplified fallback dataset if the file cannot be found.
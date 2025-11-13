# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[INSERT EMAIL ADDRESS]**. You will receive a response within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Best Practices

This application uses browser's `localStorage` for data storage. Please note:

- All data is stored locally in the user's browser
- No data is sent to external servers
- Users can export/import their data
- Users should be careful when sharing exported data files

## Data Privacy

- This application does not collect any personal information
- All data is stored locally in the user's browser
- No analytics or tracking is implemented
- No cookies are used (except for service worker registration)

## Reporting Issues

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public GitHub issue
2. Email the security team at **[INSERT EMAIL ADDRESS]**
3. Include a detailed description of the vulnerability
4. Include steps to reproduce the vulnerability
5. Wait for our response before disclosing publicly

We appreciate your help in keeping this project secure!


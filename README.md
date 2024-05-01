<!-- Morgan package -->

Print log when user call a request
Usage:
app.use(morgan('dev'))

Method:

- morgan('combined') : for use on prod - this morgan using method of Apache
- morgan('dev'): for use on dev
- morgan('common')
- morgan('short')
- morgan('tiny')

<!-- Helmet package -->

Using for protect our application, prevent third-party to access and retrieve our application's data and information as well

Usage:
app.use(helmet());

Use command line: curl --server-url --include
to see the difference when apply it

<!-- Compression package -->

Using for compression the data server

<!-- Check Router Secure -->

We must have the apiKey and check the apiKey and also the permission of this key in the api was called in
With this approach, it would be make sure that the api was called securely

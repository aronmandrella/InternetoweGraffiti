<?php

// --- USTAWIENIE FUNKCJI OBSŁUGI BŁĘDÓW (pod debuging) --- //

set_error_handler("errorHandler");
register_shutdown_function("shutdownHandler");

// ---------------- FUNKCJE OBSŁUGUJĄCE BŁĘDY ------------- //

// Funckja do obsługi błędów składni itp.
function errorHandler($error_level, $error_message, $error_file, $error_line, $error_context)
{
    $error = "lvl: " . $error_level . " | msg:" . $error_message . " | file:" . $error_file . " | ln:" . $error_line;
    switch ($error_level) {
        case E_ERROR:
        case E_CORE_ERROR:
        case E_COMPILE_ERROR:
        case E_PARSE:
            errorLogger($error, "fatal");
            break;
        case E_USER_ERROR:
        case E_RECOVERABLE_ERROR:
            errorLogger($error, "error");
            break;
        case E_WARNING:
        case E_CORE_WARNING:
        case E_COMPILE_WARNING:
        case E_USER_WARNING:
            // errorLogger($error, "warn");
            break;
        case E_NOTICE:
        case E_USER_NOTICE:
            // errorLogger($error, "info");
            break;
        case E_STRICT:
            errorLogger($error, "debug");
            break;
        default:
            // errorLogger($error, "warn");
    }
}

// Funckja wywoływana gdy skrypt PHP kończy działanie.
function shutdownHandler() //will be called when php script ends.
{
    $lasterror = error_get_last();
    switch ($lasterror['type'])
    {
        case E_ERROR:
        case E_CORE_ERROR:
        case E_COMPILE_ERROR:
        case E_USER_ERROR:
        case E_RECOVERABLE_ERROR:
        case E_CORE_WARNING:
        case E_COMPILE_WARNING:
        case E_PARSE:
            $error = "[SHUTDOWN] lvl:" . $lasterror['type'] . " | msg:" . $lasterror['message'] .
                " | file:" . $lasterror['file'] . " | ln:" . $lasterror['line'];
            errorLogger($error, "fatal");
    }
}

// Wypisanie informacji o błędzie.
function errorLogger($error, $errlvl)
{
    echo $error;
}

?>
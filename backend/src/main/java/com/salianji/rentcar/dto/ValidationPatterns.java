package com.salianji.rentcar.dto;

// Të njëjtat rregulla si në frontend (core/validators.ts)
public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    // 067/068/069 + 7 shifra, ose +35567/68/69 + 7 shifra
    public static final String PHONE = "^(\\+355|0)6[789]\\d{7}$";

    // 6–12 shkronja ose shifra
    public static final String LICENSE = "^[A-Za-z0-9]{6,12}$";

    // të paktën 8 karaktere, me shkronja dhe shifra
    public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$";

    // bosh ose 4 shifra
    public static final String ZIP_CODE = "^(\\d{4})?$";

    // bosh ose adresë http(s)
    public static final String URL = "^(https?://.+)?$";
}

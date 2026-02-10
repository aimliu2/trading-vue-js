// import other stuff
// can be used in webpack or not !?

/**
 * int_clamp function
 * @param n : input number
 * @param min : minnimum range
 * @param max : maximum range
 * @returns : integer with in min and max
 */
export const int_clamp = (n:number, min:number, max:number):number => {
    let clampValue = n <= min ? min : (n >= max ? max : n);
        return (clampValue| 0) //  bitwise OR truncation for 32-bit integers.
    }


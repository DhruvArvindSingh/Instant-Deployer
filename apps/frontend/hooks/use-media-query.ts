import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        // Create an event listener
        const listener = () => {
            setMatches(media.matches)
        }

        // Add the listener to watch for changes
        media.addEventListener("change", listener)

        // Clean up listener on unmount
        return () => {
            media.removeEventListener("change", listener)
        }
    }, [matches, query])

    return matches
} 
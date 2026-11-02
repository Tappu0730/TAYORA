(() => {
    const apiBase = window.TAYORA_CONFIG?.apiBaseUrl || "http://127.0.0.1:8000/api";
    const video = document.getElementById("scanVideo");
    const canvas = document.getElementById("scanCanvas");
    const placeholder = document.getElementById("cameraPlaceholder");
    const cameraStatus = document.getElementById("cameraStatus");
    const scanStatus = document.getElementById("scanStatus");
    const startButton = document.getElementById("startCameraButton");
    const analyzeButton = document.getElementById("analyzeFrameButton");
    const stopButton = document.getElementById("stopCameraButton");
    const uploadInput = document.getElementById("scanPhotoUpload");
    const analyzeUploadButton = document.getElementById("analyzeUploadButton");
    const uploadStatus = document.getElementById("uploadStatus");
    const recommendButton = document.getElementById("recommendButton");
    const resultsSection = document.getElementById("scanResults");
    const summaryList = document.getElementById("scanSummary");
    const resultList = document.getElementById("scanResultList");
    const faceShape = document.getElementById("faceShape");
    const faceShapeSource = document.getElementById("faceShapeSource");
    const hairType = document.getElementById("hairType");
    const bodyProfile = document.getElementById("bodyProfile");
    const scanBudget = document.getElementById("scanBudget");
    const maxUploadSize = 5 * 1024 * 1024;
    const allowedUploadTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    let cameraStream = null;
    let faceShapeSourceValue = "not selected";

    video.hidden = true;
    placeholder.hidden = false;

    const readProfile = () => {
        try {
            return JSON.parse(localStorage.getItem("tayoraProfile") || "{}") || {};
        } catch {
            return {};
        }
    };

    const profile = readProfile();
    const savedFace = profile.faceShape || profile.face || "";
    const savedHair = profile.hairType || profile.hair || "";
    if ([...faceShape.options].some((option) => option.value === savedFace || option.text === savedFace)) {
        faceShape.value = savedFace;
        faceShapeSourceValue = "saved profile";
        faceShapeSource.textContent = "Source: saved profile. Confirm or change it.";
    }
    if ([...hairType.options].some((option) => option.value === savedHair || option.text === savedHair)) {
        hairType.value = savedHair;
    }
    if (profile.monthlyBudget != null || profile.budget != null) {
        scanBudget.value = profile.monthlyBudget ?? profile.budget;
    }

    const setCameraStatus = (message) => {
        cameraStatus.textContent = message;
    };

    const setScanStatus = (message) => {
        scanStatus.textContent = message;
    };

    const setFaceShapeSource = (source) => {
        faceShapeSourceValue = source;
        faceShapeSource.textContent = `Source: ${source}. Confirm or change it.`;
    };

    const selectedValues = (name) =>
        [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraStatus("This browser does not support camera access. You can continue with manual observations.");
            return;
        }

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 540 } },
                audio: false
            });
            video.srcObject = cameraStream;
            placeholder.hidden = true;
            video.hidden = false;
            startButton.disabled = true;
            analyzeButton.disabled = false;
            stopButton.disabled = false;
            setCameraStatus("Camera is on. Center yourself in the preview, then analyze one frame when ready.");
        } catch (error) {
            setCameraStatus(
                error.name === "NotAllowedError"
                    ? "Camera permission was declined. You can continue with manual observations."
                    : "Camera could not be started. You can continue with manual observations."
            );
        }
    };

    const stopCamera = () => {
        cameraStream?.getTracks().forEach((track) => track.stop());
        cameraStream = null;
        video.srcObject = null;
        video.hidden = true;
        placeholder.hidden = false;
        startButton.disabled = false;
        analyzeButton.disabled = true;
        stopButton.disabled = true;
        setCameraStatus("Camera is off. No video was saved.");
    };

    const measureFrameQuality = () => {
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const width = Math.min(video.videoWidth, 360);
        const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        const pixels = context.getImageData(0, 0, width, height).data;
        let total = 0;
        let totalSquared = 0;
        let count = 0;
        for (let index = 0; index < pixels.length; index += 16) {
            const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
            total += brightness;
            totalSquared += brightness * brightness;
            count += 1;
        }
        const average = total / count;
        const variance = Math.max(0, totalSquared / count - average * average);
        return { average, variance };
    };

    const getFrameBlob = () => new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.82);
    });

    const requestFaceShape = async (blob, filename) => {
        const formData = new FormData();
        formData.append("photo", blob, filename);
        const response = await fetch(`${apiBase}/face-shape/analyze`, {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Face-shape analysis failed.");
        return result;
    };

    const stableFrameResult = (results) => {
        const usable = results.filter(
            (result) => result.face_detected && result.quality?.ready !== false && result.estimated_face_shape
        );
        if (!usable.length) return results[results.length - 1] || { face_detected: false };

        const counts = new Map();
        usable.forEach((result) => {
            const shape = result.estimated_face_shape;
            counts.set(shape, (counts.get(shape) || 0) + 1);
        });
        const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
        const [shape, count] = ranked[0];
        const tied = ranked[1]?.[1] === count;
        return {
            ...usable[usable.length - 1],
            estimated_face_shape: tied ? "uncertain" : shape,
            stable_frame_count: usable.length,
            stable_shape_count: tied ? 0 : count
        };
    };

    const applyFaceShapeResult = (result, statusSetter, sourceLabel) => {
        if (result.face_detected && result.estimated_face_shape) {
            const estimated = result.estimated_face_shape
                .split(" ")
                .map((word) => word.toLowerCase() === "or" ? "or" : word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            const matchingOption = [...faceShape.options].find(
                (option) => option.text.toLowerCase() === estimated.toLowerCase()
            );
            if (matchingOption) faceShape.value = matchingOption.value;
            setFaceShapeSource(sourceLabel);
            const qualityNote = result.quality?.messages?.length
                ? ` ${result.quality.messages.join(" ")}`
                : "";
            statusSetter(`Possible face-shape estimate: ${estimated}. You can change it below.${qualityNote}`);
            return;
        }
        setFaceShapeSource("not reliable");
        statusSetter("No face was detected. Choose a face shape manually or try a clearer photo.");
    };

    const analyzeUploadedPhoto = async () => {
        const file = uploadInput.files?.[0];
        if (!file || !allowedUploadTypes.has(file.type) || file.size > maxUploadSize) {
            uploadStatus.textContent = "Choose a JPG, PNG, or WebP photo under 5 MB.";
            return;
        }

        analyzeUploadButton.disabled = true;
        uploadStatus.textContent = "Analyzing one temporary photo for face shape...";
        try {
            const result = await requestFaceShape(file, file.name);
            applyFaceShapeResult(result, (message) => { uploadStatus.textContent = message; }, "uploaded photo");
        } catch (error) {
            uploadStatus.textContent = `Photo could not be analyzed: ${error.message}`;
        } finally {
            analyzeUploadButton.disabled = false;
        }
    };

    const analyzeFrame = async () => {
        if (!cameraStream || !video.videoWidth) {
            setCameraStatus("Start the camera and wait for the preview before analyzing a frame.");
            return;
        }

        analyzeButton.disabled = true;
        try {
            const quality = measureFrameQuality();
            if (quality.average < 45) {
                setCameraStatus("The frame is quite dark. Add light and try again; the estimate may otherwise be unreliable.");
            } else if (quality.average > 235) {
                setCameraStatus("The frame is very bright. Reduce glare and try again for a clearer estimate.");
            } else {
                setCameraStatus("Capturing three temporary frames for a steadier face-shape estimate...");
            }

            const frameResults = [];
            for (let frameIndex = 0; frameIndex < 3; frameIndex += 1) {
                if (frameIndex > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 180));
                }
                measureFrameQuality();
                const blob = await getFrameBlob();
                if (!blob) throw new Error("Could not capture a frame.");
                frameResults.push(await requestFaceShape(blob, `live-scan-${frameIndex + 1}.jpg`));
            }

            const result = stableFrameResult(frameResults);
            applyFaceShapeResult(
                result,
                setCameraStatus,
                `camera (${result.stable_frame_count || 1} stable frame${result.stable_frame_count === 1 ? "" : "s"})`
            );

            // Remove the temporary pixel data as soon as the request has completed.
            canvas.width = 1;
            canvas.height = 1;
        } catch (error) {
            setCameraStatus(`The frame could not be analyzed: ${error.message} You can continue manually.`);
        } finally {
            analyzeButton.disabled = !cameraStream;
        }
    };

    const makeResultCard = (recommendation) => {
        const card = document.createElement("article");
        card.className = "mini-card";
        const category = document.createElement("span");
        category.className = "pill";
        category.textContent = String(recommendation.category || "suggestion").replaceAll("_", " ").toUpperCase();
        const title = document.createElement("h3");
        title.textContent = recommendation.title || "Suggestion";
        const description = document.createElement("p");
        description.textContent = recommendation.description || "Explore this idea at your own pace.";
        card.append(category, title, description);
        if (recommendation.ingredients?.length) {
            const ingredients = document.createElement("p");
            ingredients.textContent = `Possible ingredients: ${recommendation.ingredients.join(", ")}.`;
            card.appendChild(ingredients);
        }
        return card;
    };

    const makeSummaryCard = (label, value) => {
        const card = document.createElement("article");
        card.className = "mini-card";
        const title = document.createElement("h3");
        title.textContent = label;
        const detail = document.createElement("p");
        detail.textContent = value;
        card.append(title, detail);
        return card;
    };

    const renderScanSummary = (payload) => {
        const preferences = payload.preferences || {};
        const listValue = (values) => values?.length ? values.join(", ") : "None confirmed";
        const budget = preferences.budget == null ? "Not provided" : `₹${preferences.budget}`;
        const cards = [
            makeSummaryCard("Face shape", payload.face_shape || "Not sure"),
            makeSummaryCard("Face shape source", payload.face_shape_source || "manual confirmation"),
            makeSummaryCard("Hair type", payload.hair_type || "Not sure"),
            makeSummaryCard("Skin observations", listValue(payload.skin_observations)),
            makeSummaryCard("Hair observations", listValue(payload.hair_observations)),
            makeSummaryCard("Body proportions", payload.body_profile || "Not sure"),
            makeSummaryCard("Posture observations", listValue(payload.posture_observations)),
            makeSummaryCard("Budget", budget)
        ];
        summaryList.replaceChildren(...cards);
        summaryList.hidden = false;
    };

    const getRecommendations = async () => {
        const budgetValue = scanBudget.value.trim();
        const budget = budgetValue === "" ? null : Number(budgetValue);
        if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
            setScanStatus("Enter a valid non-negative budget or leave it blank.");
            scanBudget.focus();
            return;
        }

        const payload = {
            face_shape: faceShape.value || null,
            face_shape_source: faceShapeSourceValue,
            skin_observations: selectedValues("skinObservation"),
            hair_type: hairType.value || null,
            hair_observations: selectedValues("hairObservation"),
            body_profile: bodyProfile.value || null,
            posture_observations: selectedValues("postureObservation"),
            preferences: {
                budget,
                style: profile.clothingPreference || profile.style || null
            }
        };

        recommendButton.disabled = true;
        setScanStatus("Preparing suggestions from your confirmed observations...");
        try {
            const response = await fetch(`${apiBase}/scan/recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Recommendations could not be loaded.");

            renderScanSummary(result.scan_summary || payload);
            resultList.replaceChildren(...(result.recommendations || []).map(makeResultCard));
            resultsSection.hidden = false;
            setScanStatus("Suggestions are ready. Review them as general guidance and adjust your observations whenever needed.");
            resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            setScanStatus(`Could not load scan suggestions: ${error.message}`);
        } finally {
            recommendButton.disabled = false;
        }
    };

    startButton.addEventListener("click", startCamera);
    stopButton.addEventListener("click", stopCamera);
    analyzeButton.addEventListener("click", analyzeFrame);
    faceShape.addEventListener("change", () => setFaceShapeSource("manual confirmation"));
    uploadInput.addEventListener("change", () => {
        const file = uploadInput.files?.[0];
        const valid = file && allowedUploadTypes.has(file.type) && file.size <= maxUploadSize;
        analyzeUploadButton.disabled = !valid;
        uploadStatus.textContent = valid
            ? "Photo selected. Click Analyze uploaded photo to continue."
            : "Choose a JPG, PNG, or WebP photo under 5 MB.";
    });
    analyzeUploadButton.addEventListener("click", analyzeUploadedPhoto);
    recommendButton.addEventListener("click", getRecommendations);
    window.addEventListener("beforeunload", stopCamera);
})();

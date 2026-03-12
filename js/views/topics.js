import { navigate } from "../router.js";
import { saveState } from "../storage.js";
import { renderApp } from "../app.js";

export function checkFirstTopic(state) {
    if (state.topics.length === 0) {
        navigate("view-setup-topic");
        renderSetupTopicView(state);
        disableMenue();
        return;
    }

    activateMenue();
    navigate("view-dashboard");
}

export function renderSetupTopicView(state) {
    const title = document.getElementById("setup-title");
    const desc = document.getElementById("setup-description");

    if (state.topics.length === 0) {
        title.textContent = "Welcome!";
        desc.textContent =
            "It looks like you haven't created a learning topic yet. Please create your first topic.";
    } else {
        title.textContent = "Create new topic";
        desc.textContent =
            "Enter a name for your new learning topic.";
    }
}

function disableMenue() {
    const buttons = document.querySelectorAll(".menue-btns");
    buttons.forEach(function (button) {
        button.disabled = true;
    });
}

function activateMenue() {
    const buttons = document.querySelectorAll(".menue-btns");
    buttons.forEach(function (button) {
        button.disabled = false;
    });
}

export function bindTopicSetupForm(state) {
    clearSetupErrorMsg();

    const form = document.getElementById("setup-topic-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const topicName = getSetupInput();
        if (!topicName) {
            return;
        }

        const normalized = topicName.trim().toLowerCase();

        const exists = state.topics.some(function (topic) {
            return topic.name.trim().toLowerCase() === normalized;
        });

        if (exists) {
            setupErrorMsg("Oops. Topic already exists. Choose a different name.");
            return;
        }

        const newTopic = createTopic(topicName);
        state.topics.push(newTopic);
        state.activeTopicId = newTopic.id;

        saveState(state);
        activateMenue();
        navigate("view-dashboard");
        renderApp();
    });
}

function getSetupInput() {
    const setupInput = document.getElementById("input-setup-topic");
    const topicName = setupInput.value.trim();

    if (!topicName) {
        return null;
    }

    if (topicName.length === 0) {
        setupErrorMsg("Oops. Looks like you forgot to put a name inside. Please enter a name!");
        return null;
    }

    if (!/\p{L}/u.test(topicName)) {
        setupErrorMsg("Oops. The name shouldnt consist only of numbers or symbols. Please try again!");
        return null;
    }

    clearSetupErrorMsg();
    return topicName;
}

function createTopic(topicName) {
    return {
        name: topicName,
        id: Date.now() + Math.random(),
        createdAt: Date.now()
    };
}

function setupErrorMsg(error) {
    const input = document.getElementById("input-setup-topic");
    const output = document.getElementById("output-setup-topic");

    if (input) {
        input.value = "";
        input.focus();
    }

    if (output) {
        output.textContent = error;
    }
}

export function clearSetupErrorMsg() {
    const output = document.getElementById("output-setup-topic");
    const input = document.getElementById("input-setup-topic");

    if (input) {
        input.value = "";
        input.focus();
    }

    if (output) {
        output.textContent = "";
    }
}

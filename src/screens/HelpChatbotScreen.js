// src/screens/HelpChatbotScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { COLORS } from "../config/constants";


/**
 * Nested conversation tree.
 * Each node: { id, text (bot), options: [ { id, label, nextNodeId } ], fallback (text for typed input) }
 * Deep chains created for the 'Report Problem' flow (6 levels) as requested.
 */
const TREE = {
  root: {
    id: "root",
    text:
      "Hey! 👋 I'm Selecto Assistant. How can I help today? Choose a topic or type your question below.",
    options: [
      { id: "track", label: "Track my order", next: "track_1" },
      { id: "report", label: "Report a problem", next: "report_1" },
      { id: "address", label: "Change delivery address", next: "address_1" },
      { id: "payment", label: "Payment & refund", next: "payment_1" },
      { id: "other", label: "Something else", next: "other_1" },
    ],
  },

  /* ---------- Track order (simple multi-step) ---------- */
  track_1: {
    id: "track_1",
    text: "Sure — please choose:",
    options: [
      { id: "track_status", label: "Check order status", next: "track_2" },
      { id: "track_eta", label: "Estimated delivery time", next: "track_3" },
      { id: "track_cancel", label: "Cancel order", next: "track_4" },
    ],
  },
  track_2: {
    id: "track_2",
    text:
      "Enter your order ID (or choose 'I don't have it') → We'll show the latest status.",
    options: [
      { id: "track_enter", label: "I have order ID (I'll type it)", next: null },
      { id: "track_noid", label: "I don't have it", next: "track_noid_help" },
    ],
  },
  track_noid_help: {
    id: "track_noid_help",
    text:
      "No worries — open Orders in your account and pick the order. Or tell me the phone number used to place the order.",
    options: [
      { id: "track_phone", label: "Provide phone number", next: null },
      { id: "track_orders_page", label: "I'll check Orders page", next: null },
    ],
  },
  track_3: {
    id: "track_3",
    text: "Most orders arrive within 30–45 minutes in your area. Want me to check ETA for a specific order?",
    options: [
      { id: "track_specific_yes", label: "Yes — check specific order", next: null },
      { id: "track_general_no", label: "No, that's enough", next: "end_thanks" },
    ],
  },
  track_4: {
    id: "track_4",
    text:
      "To cancel, we need the order ID. If the order is already out for delivery cancellation may not be possible.",
    options: [
      { id: "track_cancel_request", label: "Request cancellation", next: null },
      { id: "track_cancel_no", label: "Don't cancel", next: "end_helpful" },
    ],
  },

  /* ---------- Report a problem (deep multi-level flow) ---------- */
  report_1: {
    id: "report_1",
    text: "I'm sorry to hear that. What kind of problem are you facing?",
    options: [
      { id: "rp_wrong_item", label: "Wrong / missing item", next: "report_2_wrong" },
      { id: "rp_quality", label: "Quality issue (spoiled/damaged)", next: "report_2_quality" },
      { id: "rp_late", label: "Order delayed / not delivered", next: "report_2_late" },
      { id: "rp_other", label: "Other issues", next: "report_2_other" },
    ],
  },

  // level 2
  report_2_wrong: {
    id: "report_2_wrong",
    text: "Did the item arrive damaged, or was it completely missing/wrong?",
    options: [
      { id: "rp_damaged", label: "Damaged", next: "report_3_damaged" },
      { id: "rp_missing", label: "Missing / Wrong item", next: "report_3_missing" },
    ],
  },
  report_2_quality: {
    id: "report_2_quality",
    text: "Is the issue about freshness, packaging, or wrong expiry?",
    options: [
      { id: "rp_fresh", label: "Not fresh / expired", next: "report_3_fresh" },
      { id: "rp_pack", label: "Packaging damaged", next: "report_3_pack" },
    ],
  },
  report_2_late: {
    id: "report_2_late",
    text: "Is it still showing 'Out for delivery' or 'Delivered' incorrectly?",
    options: [
      { id: "rp_out_for", label: "Out for delivery too long", next: "report_3_outfor" },
      { id: "rp_marked_delivered", label: "Marked delivered but I didn't get it", next: "report_3_notdel" },
    ],
  },
  report_2_other: {
    id: "report_2_other",
    text: "Please choose a close option — or type your problem in the chat.",
    options: [
      { id: "rp_payment_issue", label: "Payment related", next: "report_3_payment" },
      { id: "rp_app_issue", label: "App / promo code issue", next: "report_3_app" },
    ],
  },

  // level 3 (more details)
  report_3_damaged: {
    id: "report_3_damaged",
    text:
      "Sorry about that. We can either (A) refund, or (B) replace the item. Which do you prefer?",
    options: [
      { id: "rp_choice_refund", label: "Refund", next: "report_4_refund" },
      { id: "rp_choice_replace", label: "Replace", next: "report_4_replace" },
    ],
  },
  report_3_missing: {
    id: "report_3_missing",
    text:
      "We can (A) locate the missing item and deliver, (B) refund the amount. Which would you like?",
    options: [
      { id: "rp_locate", label: "Locate & deliver", next: "report_4_locate" },
      { id: "rp_refund2", label: "Refund", next: "report_4_refund" },
    ],
  },
  report_3_fresh: {
    id: "report_3_fresh",
    text:
      "Understood — freshness issues are important. Do you want a refund or a replacement?",
    options: [
      { id: "rp_fresh_refund", label: "Refund", next: "report_4_refund" },
      { id: "rp_fresh_replace", label: "Replacement", next: "report_4_replace" },
    ],
  },
  report_3_pack: {
    id: "report_3_pack",
    text: "Packaging issue — we can offer a refund or offer a voucher. Which do you prefer?",
    options: [
      { id: "rp_pack_refund", label: "Refund", next: "report_4_refund" },
      { id: "rp_pack_voucher", label: "Voucher", next: "report_4_voucher" },
    ],
  },
  report_3_outfor: {
    id: "report_3_outfor",
    text:
      "Delivery is taking longer than expected. Do you want me to contact the delivery partner or wait another 15 mins?",
    options: [
      { id: "rp_contact_partner", label: "Contact partner", next: "report_4_contact" },
      { id: "rp_wait", label: "Wait 15 mins", next: "end_waiting" },
    ],
  },
  report_3_notdel: {
    id: "report_3_notdel",
    text:
      "Let's escalate — please confirm you'd like us to open an investigation (we'll need your order ID).",
    options: [
      { id: "rp_escalate_yes", label: "Yes, escalate", next: "report_4_escalate" },
      { id: "rp_escalate_no", label: "No, I'll check", next: "end_helpful" },
    ],
  },
  report_3_payment: {
    id: "report_3_payment",
    text: "Payment issue — charged incorrectly or failed? Choose one.",
    options: [
      { id: "rp_charged", label: "Charged incorrectly", next: "report_4_payment" },
      { id: "rp_failed", label: "Payment failed but charged", next: "report_4_payment" },
    ],
  },
  report_3_app: {
    id: "report_3_app",
    text: "App issue — crash, promo not applied or something else?",
    options: [
      { id: "rp_crash", label: "App crash", next: "report_4_appcrash" },
      { id: "rp_promo", label: "Promo code issue", next: "report_4_promo" },
    ],
  },

  // level 4
  report_4_refund: {
    id: "report_4_refund",
    text:
      "Refund requested. We'll process it within 3–5 working days. Would you like a reference ID for this request?",
    options: [
      { id: "rp_ref_yes", label: "Yes, give reference", next: "report_5_refid" },
      { id: "rp_ref_no", label: "No, thanks", next: "end_thanks" },
    ],
  },
  report_4_replace: {
    id: "report_4_replace",
    text:
      "Replace requested. We will try to dispatch a replacement; this may take 30–60 mins. Confirm replace?",
    options: [
      { id: "rp_replace_confirm", label: "Confirm replace", next: "report_5_replace_confirm" },
      { id: "rp_replace_cancel", label: "Cancel", next: "end_helpful" },
    ],
  },
  report_4_locate: {
    id: "report_4_locate",
    text: "Locate & deliver: we will contact the store and deliver if available. Proceed?",
    options: [
      { id: "rp_locate_yes", label: "Proceed", next: "report_5_locate" },
      { id: "rp_locate_no", label: "No", next: "end_helpful" },
    ],
  },
  report_4_voucher: {
    id: "report_4_voucher",
    text: "A voucher will be issued for the item value. Do you want it now?",
    options: [
      { id: "rp_voucher_yes", label: "Yes, issue voucher", next: "report_5_voucher" },
      { id: "rp_voucher_no", label: "No", next: "end_helpful" },
    ],
  },
  report_4_contact: {
    id: "report_4_contact",
    text: "Contacting delivery partner now. We'll update you shortly. Anything else?",
    options: [{ id: "rp_contact_done", label: "Thanks", next: "end_thanks" }],
  },
  report_4_escalate: {
    id: "report_4_escalate",
    text: "Investigation opened. Reference number will be provided. Do you want updates via SMS?",
    options: [
      { id: "rp_sms_yes", label: "Yes, SMS", next: "report_5_refid" },
      { id: "rp_sms_no", label: "No", next: "end_thanks" },
    ],
  },
  report_4_payment: {
    id: "report_4_payment",
    text:
      "We'll verify the transaction and refund if required. Please provide the order ID or transaction reference.",
    options: [
      { id: "rp_provide_tx", label: "I'll type it", next: null },
      { id: "rp_need_help", label: "I need help finding it", next: null },
    ],
  },
  report_4_appcrash: {
    id: "report_4_appcrash",
    text:
      "Please try reinstalling the app. If issue persists, provide a short description of when it crashes.",
    options: [
      { id: "rp_done", label: "Done — still crashing", next: "report_5_app_escalate" },
      { id: "rp_fixed", label: "Fixed it", next: "end_thanks" },
    ],
  },
  report_4_promo: {
    id: "report_4_promo",
    text: "Promo issues are usually due to min. order or expiry. Share promo code or choose examples.",
    options: [
      { id: "rp_share_code", label: "I'll share code", next: null },
      { id: "rp_examples", label: "Show common reasons", next: "report_5_promo_examples" },
    ],
  },

  // level 5
  report_5_refid: {
    id: "report_5_refid",
    text:
      "Reference ID created: REF12345. We will notify you when resolved. Anything else I can help with?",
    options: [{ id: "rp_done1", label: "No, thanks", next: "end_thanks" }],
  },
  report_5_replace_confirm: {
    id: "report_5_replace_confirm",
    text:
      "Replacement confirmed — dispatch expected within 45 mins. We'll message you on updates.",
    options: [{ id: "rp_done2", label: "Great, thanks", next: "end_thanks" }],
  },
  report_5_locate: {
    id: "report_5_locate",
    text:
      "Store contacted. They confirmed availability — delivery scheduled. Need anything else?",
    options: [{ id: "rp_done3", label: "No, thanks", next: "end_thanks" }],
  },
  report_5_voucher: {
    id: "report_5_voucher",
    text:
      "Voucher issued for ₹VALUE — valid for 30 days. Use it on your next order.",
    options: [{ id: "rp_done4", label: "Thanks", next: "end_thanks" }],
  },
  report_5_app_escalate: {
    id: "report_5_app_escalate",
    text:
      "Escalation created for app crash. Our tech team will investigate. Provide screenshots if possible.",
    options: [{ id: "rp_done5", label: "Will do", next: "end_thanks" }],
  },
  report_5_promo_examples: {
    id: "report_5_promo_examples",
    text:
      "Common reasons: promo expired, min order not met, user not eligible, or one-time use only.",
    options: [{ id: "rp_done6", label: "Got it", next: "end_helpful" }],
  },

  /* ---------- Address flow (shorter) ---------- */
  address_1: {
    id: "address_1",
    text: "Change delivery address — do you want to add, edit or set default?",
    options: [
      { id: "addr_add", label: "Add new address", next: null },
      { id: "addr_edit", label: "Edit existing address", next: null },
      { id: "addr_set", label: "Set default address", next: null },
    ],
  },

  /* ---------- Payment flow ---------- */
  payment_1: {
    id: "payment_1",
    text: "Payment & refunds — what's the issue?",
    options: [
      { id: "pay_refund", label: "Request refund", next: null },
      { id: "pay_failed", label: "Payment failed but charged", next: null },
      { id: "pay_method", label: "Change payment method", next: null },
    ],
  },

  /* ---------- Other ---------- */
  other_1: {
    id: "other_1",
    text: "Tell me in a few words what's on your mind, or choose a quick option.",
    options: [
      { id: "oth_feedback", label: "Give feedback", next: null },
      { id: "oth_contact", label: "Contact support", next: null },
    ],
  },

  /* ---------- End nodes ---------- */
  end_thanks: {
    id: "end_thanks",
    text: "Happy to help! If anything else comes up, just ping me 🙂",
    options: [{ id: "end_restart", label: "Back to main menu", next: "root" }],
  },
  end_helpful: {
    id: "end_helpful",
    text: "Got it — if you need anything else, I'm here. Would you like to go back to main menu?",
    options: [{ id: "end_restart2", label: "Main menu", next: "root" }],
  },
};

/* ------------------- Helper ------------------- */
const isGreeting = (text = "") => {
  const t = text.trim().toLowerCase();
  return ["hi", "hello", "hey", "hii"].includes(t) || t.length <= 0;
};

/* ------------------- Chat screen ------------------- */
export default function HelpChatbotScreen() {
  const navigation = useNavigation();
  const listRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [nodeStack, setNodeStack] = useState(["root"]); // stack of node ids
  const [input, setInput] = useState("");

  useEffect(() => {
    // Start with root node message
    const root = TREE.root;
    pushBotMessage(root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to push a bot message (and options)
  const pushBotMessage = (node) => {
  if (!node) return;
  const m = {
    id: `m_${Date.now()}_${Math.random()}`,
    type: "bot",
    text: node.text,
    options: node.options ?? null,
    nodeId: node.id,
  };
  setMessages((p) => [...p, m]);
  setTimeout(() => scrollToEnd(), 120);
};


  // helper to push user message (text)
  const pushUserMessage = (text) => {
    const m = { id: `u_${Date.now()}`, type: "user", text };
    setMessages((p) => [...p, m]);
    setTimeout(() => scrollToEnd(), 80);
  };

  // navigate to next node (and maintain stack)
  const goToNode = (nextNodeId, pushUser = true, userLabel = null) => {
    if (!nextNodeId) {
      // leaf expecting user typed input; show prompt
      if (pushUser && userLabel) pushUserMessage(userLabel);
      pushBotMessage({
        id: `prompt_${Date.now()}`,
        text: "Please type the details (order ID / phone / transaction id etc.) in the input below.",
      });
      setNodeStack((s) => [...s, null]); // placeholder for typed node
      return;
    }

    // push user message first if called from option press
    if (pushUser && userLabel) pushUserMessage(userLabel);

    const node = TREE[nextNodeId];
    if (!node) {
      pushBotMessage({
        id: `err_${Date.now()}`,
        text: "Sorry, something went wrong. Going back to main menu.",
        options: TREE.root.options,
      });
      setNodeStack(["root"]);
      setTimeout(() => pushBotMessage(TREE.root), 400);
      return;
    }

    setNodeStack((s) => [...s, node.id]);
    pushBotMessage(node);
  };

  // Back action: pop stack and show previous node's message (replay)
  const handleGoBack = () => {
    if (nodeStack.length <= 1) {
      // already at root
      navigation.goBack();
      return;
    }
    const newStack = [...nodeStack];
    newStack.pop(); // remove current
    const prev = newStack[newStack.length - 1];
    setNodeStack(newStack);

    // append user "Go back" message and re-show the previous node
    pushUserMessage("Go back");
    const prevNode = TREE[prev] ?? TREE.root;
    pushBotMessage(prevNode);
  };

  // Option tapped
  const handleOptionPress = (option, hostNode) => {
    // option: { id, label, next }
    // hostNode: the node where the option came from (so we can maintain stack)
    if (!option) return;
    goToNode(option.next, true, option.label);
  };

  // typed input submit
  const handleSend = () => {
    if (!input.trim()) return;
    const txt = input.trim();
    setInput("");

    // If greeting typed -> restart flow
    if (isGreeting(txt) || txt.toLowerCase().includes("my name")) {
      pushUserMessage(txt);
      // short greeting reply
      const greet = {
        id: `greet_${Date.now()}`,
        text: `Hi ${txt}! Happy to help. Here are the main things I can do:`,
        options: TREE.root.options,
      };
      setNodeStack(["root"]);
      pushBotMessage(greet);
      return;
    }

    // Otherwise, push as user message
    pushUserMessage(txt);

    // If current stack top is null (we were expecting an input for a node)
    const top = nodeStack[nodeStack.length - 1];
    if (top === null) {
      // treat as input to previous branch — respond with canned confirmation + ref id
      pushBotMessage({
        id: `ack_${Date.now()}`,
        text: `Thanks — received your details. We've logged this and will follow up within a few hours. Reference: REF${Math.floor(
          10000 + Math.random() * 89999
        )}`,
        options: [{ id: "return_root", label: "Back to main menu", next: "root" }],
      });
      // replace the placeholder with last real node (pop the null)
      setNodeStack((s) => {
        const ns = [...s];
        ns.pop();
        ns.push("root");
        return ns;
      });
      return;
    }

    // else simple fallback response (pretend we tried to answer free text)
    pushBotMessage({
      id: `fb_${Date.now()}`,
      text:
        "Thanks for that. I understand. I've created a note for support and we'll get back if needed. Would you like anything else?",
      options: [
        { id: "fb_back", label: "Main menu", next: "root" },
        { id: "fb_contact", label: "Contact support", next: null },
      ],
    });
  };

  // speak text using expo-speech (TTS)
  const speak = (text) => {
    if (!text) return;
    try {
      Speech.speak(text, { language: "en" });
    } catch (e) {
      // ignore
    }
  };

  const scrollToEnd = () => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollToEnd?.({ animated: true });
      }, 150);
    }
  };

  // Render a message bubble
  const renderMessage = ({ item }) => {
    if (item.type === "user") {
      return (
        <View style={styles.userRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // bot with options
    return (
      <View style={styles.botRow}>
        <View style={styles.botBubble}>
          <Text style={styles.botText}>{item.text}</Text>

          {/* actions: speak / go back */}
          <View style={styles.botActions}>
            <TouchableOpacity
              onPress={() => {
                // speak this bot message
                speak(item.text);
              }}
              style={styles.iconBtn}
            >
              <Ionicons name="volume-high-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Voice Input",
                  "Voice input is not available in Expo Go. Please use the text input below."
                );
              }}
              style={styles.iconBtn}
            >
              <Ionicons name="mic-outline" size={18} color={COLORS.gray} />
            </TouchableOpacity> */}
          </View>

          {/* options (rendered inside the chat flow) */}
          {item.options && item.options.length > 0 && (
            <View style={styles.optionsWrap}>
              {item.options.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionBtn}
                  onPress={() => handleOptionPress(opt, item.nodeId)}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header with back arrow to profile screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => scrollToEnd()}
        />

        {/* Input area */}
        <View style={styles.inputRow}>
         
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Type a question (e.g., 'My order is late')"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        
          <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Voice Input",
                  "Voice input is not available in Expo Go. Please use the text input below."
                );
              }}
              style={styles.iconBtn}
            >
              <Ionicons name="mic-outline" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------- Styles ------------------- */
const styles = StyleSheet.create({
  header: {
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },

  list: { padding: 16, paddingBottom: 100 },

  botRow: { alignItems: "flex-start", marginBottom: 12 },
  botBubble: {
    backgroundColor: "#F3FAF6",
    padding: 12,
    borderRadius: 12,
    maxWidth: "92%",
    alignSelf: "flex-start",
  },
  botText: { color: "#0b3a2f", fontSize: 14, marginBottom: 8 },
  botActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  iconBtn: { padding: 6, marginLeft: 6 },

  optionsWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap" },
  optionBtn: {
    backgroundColor:'#a7f0bfff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 6,
  },
  optionText: { color:COLORS.black, fontWeight: "700", fontSize: 13 },

  userRow: { alignItems: "flex-end", marginBottom: 12 },
  userBubble: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
    alignSelf: "flex-end",
  },
  userText: { color: "#fff", fontSize: 14 },

  inputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#eeededff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});